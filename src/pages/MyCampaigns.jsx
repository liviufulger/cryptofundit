import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { toast } from "react-hot-toast";
import {
  Edit2,
  Target,
  DollarSign,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const CampaignStateBadge = ({ state }) => {
  const stateColors = {
    0: "badge-primary", // Active
    1: "badge-warning", // Paused
    2: "badge-success", // Completed
  };

  const stateLabels = {
    0: "Active",
    1: "Paused",
    2: "Completed",
  };

  return (
    <span className={`badge ${stateColors[state]} gap-2`}>
      {state === 0 && <Activity className="h-4 w-4" />}
      {state === 1 && <CheckCircle className="h-4 w-4" />}
      {state === 2 && <AlertTriangle className="h-4 w-4" />}
      {stateLabels[state]}
    </span>
  );
};

const MyCampaigns = () => {
  const { contract, account, connectWallet } = useWeb3();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (account && contract) {
      fetchMyCampaigns();
    }
  }, [account, contract]);

  const fetchMyCampaigns = async () => {
    try {
      setIsLoading(true);

      const totalCampaigns = await contract.numberOfCampaigns();
      const myCampaigns = [];

      for (let i = 0; i < totalCampaigns; i++) {
        const campaignDetails = await contract.getCampaign(i);

        if (campaignDetails.owner.toLowerCase() === account.toLowerCase()) {
          const target = ethers.formatEther(campaignDetails.target);
          const totalRaised = ethers.formatEther(campaignDetails.totalRaised);
          const progressPercentage =
            (parseFloat(totalRaised) / parseFloat(target)) * 100;

          myCampaigns.push({
            id: i,
            owner: campaignDetails.owner,
            title: campaignDetails.title,
            description: campaignDetails.description,
            target,
            deadline: new Date(
              Number(campaignDetails.deadline) * 1000
            ).toLocaleString(),
            totalRaised,
            currentBalance: ethers.formatEther(campaignDetails.currentBalance),
            state: campaignDetails.state,
            image: campaignDetails.image,
            progressPercentage: Math.min(progressPercentage, 100),
          });
        }
      }

      setCampaigns(myCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to fetch campaigns.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageCampaign = (id) => {
    navigate(`/campaigns/${id}/manage`);
  };

  if (!account) {
    return (
      <div className="alert alert-warning">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>Please connect your wallet to view your campaigns.</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title">No Campaigns Yet</h2>
            <p className="text-sm text-gray-600 mb-4">
              You haven't created any campaigns. Start your first fundraising
              campaign!
            </p>
            <button
              onClick={() => navigate("/create-campaign")}
              className="btn btn-primary w-full"
            >
              Create Campaign
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Campaigns</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/create-campaign")}
        >
          <Edit2 className="mr-2 h-5 w-5" />
          Create New Campaign
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <figure className="relative">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <CampaignStateBadge state={campaign.state} />
              </div>
            </figure>

            <div className="card-body">
              <h2 className="card-title">{campaign.title}</h2>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {campaign.description || "No description provided."}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="text-sm">Target</span>
                  </div>
                  <span className="font-semibold">{campaign.target} AVAX</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Raised</span>
                  </div>
                  <span className="font-semibold">
                    {campaign.totalRaised} AVAX
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-secondary" />
                    <span className="text-sm">Deadline</span>
                  </div>
                  <span className="text-sm">{campaign.deadline}</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${campaign.progressPercentage}%` }}
                ></div>
              </div>

              <div className="card-actions justify-between items-center mt-4">
                <span className="text-sm text-gray-600">
                  {campaign.progressPercentage.toFixed(0)}% Funded
                </span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleManageCampaign(campaign.id)}
                >
                  Manage Campaign
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCampaigns;
