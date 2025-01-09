import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import CampaignCard from "../components/CampaignCard";
import CampaignEvents from "../components/CampaignEvents";
import { motion } from "framer-motion";

const HomePage = ({campaignId}) => {
  const { readOnlyContract, account, connectWallet } = useWeb3();
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCampaigns, setVisibleCampaigns] = useState(6); // Controls pagination
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (readOnlyContract) {
        try {
          setIsLoading(true);

          // Get total campaigns
          const campaignCount = await readOnlyContract.totalCampaigns();

          // Fetch campaign details
          const campaignPromises = Array.from(
            { length: Number(campaignCount) },
            (_, i) => readOnlyContract.getCampaign(i)
          );
          const fetchedCampaigns = await Promise.all(campaignPromises);

          // Filter active campaigns
          const activeCampaigns = fetchedCampaigns
            .map((campaign, index) => ({
              ...campaign,
              id: index,
              target: campaign.target,
              totalRaised: campaign.totalRaised,
              image: campaign.image,
              title: campaign.title,
              description: campaign.description,
              state: Number(campaign.state),
              deadline: Number(campaign.deadline),
              donatorCount: Number(campaign.donatorCount),
            }))
            .filter((campaign) => campaign.state === 0);

          setCampaigns(activeCampaigns);
          setFilteredCampaigns(activeCampaigns);
        } catch (error) {
          console.error("Failed to fetch campaigns", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCampaigns();
  }, [readOnlyContract]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = campaigns.filter(
      (campaign) =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query)
    );
    setFilteredCampaigns(filtered);
  };

  const loadMore = () => {
    setVisibleCampaigns((prev) => prev + 6);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Active Campaigns
          <span className="text-gray-500 text-lg ml-2">
            ({filteredCampaigns.length} active)
          </span>
        </h1>
      </div> */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Active Campaigns
          </h1>
          <p className="text-base-content/70 mt-2">
            Discover and support meaningful causes
          </p>
        </div>
        <div className="badge badge-primary badge-lg">
          {filteredCampaigns.length} Active
        </div>
      </motion.div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={handleSearch}
          className="input input-bordered w-full"
        />
      </div>

      {/* Campaigns */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center text-gray-500">
          No campaigns match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.slice(0, visibleCampaigns).map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Load More */}
      {visibleCampaigns < filteredCampaigns.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            className="btn btn-primary px-6 py-2 rounded"
          >
            Load More
          </button>
        </div>
      )}

<div className="flex justify-center mt-6">
  
      
      {/* Add the events component */}
      <CampaignEvents campaignId={campaignId} />
    </div>
    </div>
    
  );
};

export default HomePage;
