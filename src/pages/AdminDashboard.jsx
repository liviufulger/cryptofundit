import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Activity,
  PauseCircle,
  StopCircle,
  Trash2,
  RefreshCw,
  LayoutDashboard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
} from "lucide-react";

const AdminDashboard = () => {
  const { readOnlyContract, contract, account } = useWeb3();
  const [campaigns, setCampaigns] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("active");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!readOnlyContract) {
        console.error("readOnlyContract is not initialized.");
        return;
      }

      try {
        setIsLoading(true);
        const isOwner = await readOnlyContract.isContractOwner(account);
        setIsAdmin(isOwner);

        if (!isOwner) {
          toast.error("You are not authorized to view this page.");
          return;
        }

        const campaignCount = await readOnlyContract.totalCampaigns();
        const campaignPromises = Array.from(
          { length: Number(campaignCount) },
          (_, index) => readOnlyContract.getCampaign(index)
        );

        const fetchedCampaigns = await Promise.all(campaignPromises);
        const campaignsData = fetchedCampaigns.map((campaign, index) => ({
          id: index,
          title: campaign.title || "Untitled Campaign",
          state: Number(campaign.state),
          owner: campaign.owner,
          currentBalance: ethers.formatEther(campaign.currentBalance || 0),
          deadline: Number(campaign.deadline),
          totalRaised: ethers.formatEther(campaign.totalRaised || 0),
        }));

        setCampaigns(campaignsData);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [readOnlyContract, account]);

  const handleDeleteCampaign = async (id) => {
    if (!isAdmin) {
      toast.error("Only the contract owner can delete campaigns.");
      return;
    }

    try {
      const tx = await contract.deleteCampaign(id);
      toast.promise(tx.wait(), {
        loading: "Deleting campaign...",
        success: "Campaign marked as deleted",
        error: "Failed to delete campaign",
      });

      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === id ? { ...campaign, state: 3 } : campaign
        )
      );
    } catch (error) {
      console.error("Failed to delete campaign:", error);
    }
  };

  const handleRestoreCampaign = async (id) => {
    if (!isAdmin) {
      toast.error("Only the contract owner can restore campaigns.");
      return;
    }

    try {
      const tx = await contract.restoreCampaign(id);
      toast.promise(tx.wait(), {
        loading: "Restoring campaign...",
        success: "Campaign restored successfully!",
        error: "Failed to restore campaign",
      });

      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === id ? { ...campaign, state: 0 } : campaign
        )
      );
    } catch (error) {
      console.error("Failed to restore campaign:", error);
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case 0:
        return "success";
      case 1:
        return "warning";
      case 2:
        return "error";
      case 3:
        return "ghost";
      default:
        return "ghost";
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case 0:
        return <Activity className="w-5 h-5" />;
      case 1:
        return <PauseCircle className="w-5 h-5" />;
      case 2:
        return <StopCircle className="w-5 h-5" />;
      case 3:
        return <Trash2 className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getStateLabel = (state) => {
    switch (state) {
      case 0:
        return "Active";
      case 1:
        return "Paused";
      case 2:
        return "Ended";
      case 3:
        return "Deleted";
      default:
        return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card w-96 bg-error text-error-content"
        >
          <div className="card-body items-center text-center">
            <ShieldAlert className="w-16 h-16 mb-4" />
            <h2 className="card-title">Access Denied</h2>
            <p>You are not authorized to view this page.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "active", label: "Active", icon: <Activity />, state: 0 },
    { id: "paused", label: "Paused", icon: <PauseCircle />, state: 1 },
    { id: "ended", label: "Ended", icon: <StopCircle />, state: 2 },
    { id: "deleted", label: "Deleted", icon: <Trash2 />, state: 3 },
  ];

  const filteredCampaigns = campaigns.filter(
    (c) => c.state === tabs.find((t) => t.id === selectedTab)?.state
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <LayoutDashboard className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
        </div>

        <div className="stats shadow w-full">
          <div className="stat">
            <div className="stat-figure text-success">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="stat-title">Active Campaigns</div>
            <div className="stat-value text-success">
              {campaigns.filter((c) => c.state === 0).length}
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-warning">
              <Clock className="w-8 h-8" />
            </div>
            <div className="stat-title">Paused Campaigns</div>
            <div className="stat-value text-warning">
              {campaigns.filter((c) => c.state === 1).length}
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-error">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="stat-title">Ended/Deleted</div>
            <div className="stat-value text-error">
              {campaigns.filter((c) => c.state >= 2).length}
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-primary">
              <Wallet className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Raised</div>
            <div className="stat-value text-primary">
              {campaigns
                .reduce((acc, curr) => acc + Number(curr.totalRaised), 0)
                .toFixed(2)}{" "}
              AVAX
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="tabs tabs-boxed mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab gap-2 ${
              selectedTab === tab.id ? "tab-active" : ""
            }`}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Campaign Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCampaigns.map((campaign) => (
          <motion.div
            key={campaign.id}
            variants={itemVariants}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h3 className="card-title text-lg">{campaign.title}</h3>
                <div
                  className={`badge badge-${getStateColor(
                    campaign.state
                  )} gap-1`}
                >
                  {getStateIcon(campaign.state)}
                  {getStateLabel(campaign.state)}
                </div>
              </div>

              <div className="space-y-2 my-4">
                <p className="text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="text-base-content/70">Balance:</span>
                  <span className="font-semibold">
                    {campaign.currentBalance} AVAX
                  </span>
                </p>
                <p className="text-sm flex items-center gap-2 overflow-hidden">
                  <Activity className="w-4 h-4 flex-shrink-0" />
                  <span className="text-base-content/70">Owner:</span>
                  <span className="font-mono truncate">{campaign.owner}</span>
                </p>
              </div>

              <div className="card-actions justify-end mt-4">
                {campaign.state === 3 ? (
                  <button
                    onClick={() => handleRestoreCampaign(campaign.id)}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restore
                  </button>
                ) : (
                  campaign.state !== 2 && (
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="btn btn-error btn-sm gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredCampaigns.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-12">
          <AlertTriangle className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <p className="text-base-content/70">
            No campaigns found in this state
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
