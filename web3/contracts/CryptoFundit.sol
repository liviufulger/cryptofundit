// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CryptoFundit {
    enum CampaignState { Active, Paused, Completed, Deleted }

    struct Campaign {
        address payable owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 totalRaised;
        uint256 currentBalance;
        string image;
        CampaignState state;
        address[] donators;
        uint256[] donations;
        mapping(address => uint256) donationBalances;
    }

    // Admin variables
    address private immutable contractOwner;
    
    mapping(uint256 => Campaign) public campaigns;
    uint256 public totalCampaigns;

    // Events
    event CampaignCreated(uint256 indexed id, address indexed owner, string title, uint256 target, uint256 deadline);
    event DonationReceived(uint256 indexed id, address indexed donator, uint256 amount);
    event FundsWithdrawn(uint256 indexed id, address indexed owner, uint256 amount);
    event CampaignPaused(uint256 indexed id);
    event CampaignResumed(uint256 indexed id);
    event CampaignCompleted(uint256 indexed id, uint256 totalRaised);
    event CampaignUpdated(uint256 indexed id, string title, string description, uint256 target, uint256 deadline, string image);
    event CampaignDeleted(uint256 indexed id, address indexed deletedBy);

    // Constructor to set contract owner
    constructor() {
        contractOwner = msg.sender;
    }

    // Modifier for admin-only functions
    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only contract owner can perform this action");
        _;
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "The deadline must be in the future");

        Campaign storage campaign = campaigns[totalCampaigns];
        campaign.owner = payable(msg.sender);
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.image = _image;
        campaign.state = CampaignState.Active;
        campaign.totalRaised = 0;
        campaign.currentBalance = 0;

        emit CampaignCreated(totalCampaigns, msg.sender, _title, _target, _deadline);

        totalCampaigns++;
        return totalCampaigns - 1;
    }

    function updateCampaign(
        uint256 _id,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can update the campaign");
        require(campaign.state == CampaignState.Active || campaign.state == CampaignState.Paused, 
                "Campaign must be active or paused to update");
        require(_deadline > block.timestamp, "The deadline must be in the future");
        require(_target >= campaign.totalRaised, "New target cannot be less than amount already raised");

        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.image = _image;

        emit CampaignUpdated(_id, _title, _description, _target, _deadline, _image);
    }


    function donateToCampaign(uint256 _id) public payable {
        Campaign storage campaign = campaigns[_id];
        require(campaign.state == CampaignState.Active, "Campaign is not active");
        require(block.timestamp < campaign.deadline, "The campaign has ended");
        require(msg.value > 0, "Donation must be greater than zero");

        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        campaign.donationBalances[msg.sender] += msg.value;
        campaign.totalRaised += msg.value; 
        campaign.currentBalance += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value);
    }

    function withdrawFunds(uint256 _id, uint256 _amount) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can withdraw funds");
        require(_amount <= campaign.currentBalance, "Insufficient balance");
        require(campaign.state == CampaignState.Active, "Campaign is not active");

        campaign.currentBalance -= _amount;
        
        (bool sent, ) = campaign.owner.call{value: _amount}("");
        require(sent, "Failed to send funds");

        emit FundsWithdrawn(_id, campaign.owner, _amount);
    }

    function pauseCampaign(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can pause the campaign");
        require(campaign.state == CampaignState.Active, "Campaign is not active");

        campaign.state = CampaignState.Paused;
        emit CampaignPaused(_id);
    }

    function resumeCampaign(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can resume the campaign");
        require(campaign.state == CampaignState.Paused, "Campaign is not paused");
        require(block.timestamp < campaign.deadline, "Campaign deadline has passed");

        campaign.state = CampaignState.Active;
        emit CampaignResumed(_id);
    }

    function endCampaign(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner || block.timestamp >= campaign.deadline, 
                "Only owner can end before deadline");
        require(campaign.state != CampaignState.Completed, "Campaign already ended");
        require(campaign.state != CampaignState.Deleted, "Campaign is deleted");

        campaign.state = CampaignState.Completed;
        
        // Allow withdrawal of any remaining funds
        if (campaign.currentBalance > 0) {
            uint256 remainingBalance = campaign.currentBalance;
            campaign.currentBalance = 0;
            (bool sent, ) = campaign.owner.call{value: remainingBalance}("");
            require(sent, "Failed to send remaining funds");
        }

        emit CampaignCompleted(_id, campaign.totalRaised);
    }

    function getCampaign(uint256 _id)
        public
        view
        returns (
            address owner,
            string memory title,
            string memory description,
            uint256 target,
            uint256 deadline,
            uint256 totalRaised,
            uint256 currentBalance,
            string memory image,
            CampaignState state,
            uint256 donatorCount
        )
    {
        Campaign storage campaign = campaigns[_id];
        
        return (
            campaign.owner,
            campaign.title,
            campaign.description,
            campaign.target,
            campaign.deadline,
            campaign.totalRaised,
            campaign.currentBalance,
            campaign.image,
            campaign.state,
            campaign.donators.length
        );
    }

    

    function getDonators(uint256 _id) public view returns (address[] memory, uint256[] memory) {
    Campaign storage campaign = campaigns[_id];
    return (campaign.donators, campaign.donations);
}

    function getCampaignStats(uint256 _id) 
        public 
        view 
        returns (
            uint256 totalRaised,
            uint256 currentBalance,
            uint256 target,
            uint256 percentageReached,
            CampaignState state,
            uint256 deadline,
            bool isActive
        ) 
    {
        Campaign storage campaign = campaigns[_id];
        require(campaign.state != CampaignState.Deleted, "Campaign is deleted");
        uint256 percentage = (campaign.totalRaised * 100) / campaign.target;
        bool active = (campaign.state == CampaignState.Active && block.timestamp < campaign.deadline);
        
        return (
            campaign.totalRaised,
            campaign.currentBalance,
            campaign.target,
            percentage,
            campaign.state,
            campaign.deadline,
            active
        );
    }

    
    function isContractOwner(address _address) public view returns (bool) {
        return _address == contractOwner;
    }

    function restoreCampaign(uint256 _id) public onlyContractOwner {
    Campaign storage campaign = campaigns[_id];
    require(campaign.state == CampaignState.Deleted, "Campaign is not deleted");

    campaign.state = CampaignState.Active;

    emit CampaignResumed(_id);
}

    function deleteCampaign(uint256 _id) public onlyContractOwner {
        Campaign storage campaign = campaigns[_id];
        require(campaign.state != CampaignState.Deleted, "Campaign is already deleted");
        
        // If there are remaining funds, send them back to the campaign owner
        if (campaign.currentBalance > 0) {
            uint256 remainingBalance = campaign.currentBalance;
            campaign.currentBalance = 0;
            (bool sent, ) = campaign.owner.call{value: remainingBalance}("");
            require(sent, "Failed to send remaining funds");
        }
        
        campaign.state = CampaignState.Deleted;
        emit CampaignDeleted(_id, msg.sender);
    }
}