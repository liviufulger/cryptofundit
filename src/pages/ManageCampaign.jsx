import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useWeb3 } from "../context/Web3Context";
import {
  Pause,
  Play,
  StopCircle,
  Edit3,
  Save,
  Wallet,
  Target,
  Clock,
  AlertCircle,
  ArrowUpCircle,
  DollarSign,
  Users,
  Activity,
  Calendar,
  Timer,
  History,
  User,
} from "lucide-react";

const ManageCampaign = () => {
  const { id } = useParams();
  const { contract, account } = useWeb3();
  const [campaign, setCampaign] = useState(null);
  const [editDetails, setEditDetails] = useState({
    title: "",
    description: "",
    target: "",
    deadline: "",
    image: "",
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [donationHistory, setDonationHistory] = useState([]);
  const [donorStats, setDonorStats] = useState({
    totalDonors: 0,
    averageDonation: 0,
    largestDonation: 0,
    recentDonations: [],
  });

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
    if (contract) {
      fetchCampaignDetails();
    }
  }, [contract, id]);

  const fetchCampaignDetails = async () => {
    if (!contract) return;

    try {
      const campaignDetails = await contract.getCampaign(id);
      const formattedDetails = {
        id,
        owner: campaignDetails.owner,
        title: campaignDetails.title,
        description: campaignDetails.description,
        target: ethers.formatEther(campaignDetails.target),
        deadline: new Date(Number(campaignDetails.deadline) * 1000)
          .toISOString()
          .split("T")[0],
        totalRaised: ethers.formatEther(campaignDetails.totalRaised),
        currentBalance: ethers.formatEther(campaignDetails.currentBalance),
        state: Number(campaignDetails.state),
        image: campaignDetails.image,
      };

      setCampaign(formattedDetails);
      setEditDetails({
        title: formattedDetails.title,
        description: formattedDetails.description,
        target: formattedDetails.target,
        deadline: formattedDetails.deadline,
        image: formattedDetails.image,
      });

      // Fetch donation history
      const [donors, donations] = await contract.getDonators(id);
      const history = donors.map((donor, index) => ({
        donor,
        amount: ethers.formatEther(donations[index]),
      }));

      setDonationHistory(history);

      // Calculate donor statistics
      const stats = {
        totalDonors: donors.length,
        averageDonation:
          history.reduce((acc, curr) => acc + Number(curr.amount), 0) /
            donors.length || 0,
        largestDonation: Math.max(...history.map((d) => Number(d.amount))) || 0,
        recentDonations: history.slice(0, 5),
      };

      setDonorStats(stats);
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      toast.error("Failed to fetch campaign details.");
    }
  };

  const handleEditCampaign = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.updateCampaign(
        id,
        editDetails.title,
        editDetails.description,
        ethers.parseEther(editDetails.target),
        Math.floor(new Date(editDetails.deadline).getTime() / 1000),
        editDetails.image
      );
      await tx.wait();
      toast.success("Campaign updated successfully!");
      fetchCampaignDetails();
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error("Failed to update campaign.");
    }
  };

  const handleWithdrawFunds = async () => {
    try {
      const tx = await contract.withdrawFunds(
        id,
        ethers.parseEther(withdrawAmount)
      );
      await tx.wait();
      toast.success("Funds withdrawn successfully!");
      fetchCampaignDetails();
      setWithdrawAmount("");
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast.error("Failed to withdraw funds.");
    }
  };

  const handleStateChange = async (action) => {
    try {
      const tx = await contract[`${action}Campaign`](id);
      await tx.wait();
      toast.success(`Campaign ${action}d successfully!`);
      fetchCampaignDetails();
    } catch (error) {
      console.error(`Error ${action}ing campaign:`, error);
      toast.error(`Failed to ${action} campaign.`);
    }
  };

  const getTimeRemaining = () => {
    const deadline = new Date(campaign.deadline);
    const now = new Date();
    const diff = deadline - now;
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h remaining`;
  };

  if (!account) {
    return (
      <div className="alert alert-warning">
        <AlertCircle className="w-6 h-6" />
        <span>Please connect your wallet to see this page.</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
    

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Campaign Dashboard
        </h1>
        <p className="text-base-content/70 mt-2">{campaign.title}</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-primary">
            <Target className="w-8 h-8" />
          </div>
          <div className="stat-title">Target</div>
          <div className="stat-value text-primary">{campaign.target} AVAX</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-secondary">
            <ArrowUpCircle className="w-8 h-8" />
          </div>
          <div className="stat-title">Raised</div>
          <div className="stat-value text-secondary">
            {campaign.totalRaised} AVAX
          </div>
        </div>

        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-accent">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title">Donors</div>
          <div className="stat-value text-accent">{donorStats.totalDonors}</div>
        </div>

        <div className="stat bg-base-100 shadow rounded-box">
          <div className="stat-figure text-success">
            <Timer className="w-8 h-8" />
          </div>
          <div className="stat-title">Time Left</div>
          <div className="stat-value text-success text-2xl">
            {getTimeRemaining()}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Campaign Details & Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          {/* Campaign Progress */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Campaign Progress
              </h2>
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <span>Progress</span>
                  <span>
                    {((Number(campaign.totalRaised) / Number(campaign.target)) *
                      100).toFixed(2)}
                    %
                  </span>
                </div>
                <progress
                  className="progress progress-primary w-full"
                  value={campaign.totalRaised}
                  max={campaign.target}
                ></progress>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm opacity-70">Current Balance</p>
                  <p className="text-xl font-bold">
                    {campaign.currentBalance} AVAX
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Largest Donation</p>
                  <p className="text-xl font-bold">
                    {donorStats.largestDonation.toFixed(2)} AVAX
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Donations */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Donations
              </h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Donor</th>
                      <th>Amount</th>
                     
                    </tr>
                  </thead>
                  <tbody>
                    {donationHistory.slice(0, 5).map((donation, index) => (
                      <tr key={index}>
                        <td className="font-mono text-sm">
                          {donation.donor.slice(0, 6)}...
                          {donation.donor.slice(-4)}
                        </td>
                        <td>{donation.amount} AVAX</td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Campaign Controls */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
          {/* Campaign State Management */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Campaign State
              </h2>

              <div className="flex items-center gap-2 mb-6">
                <div
                  className={`badge badge-lg ${
                    campaign.state === 0
                      ? "badge-success"
                      : campaign.state === 1
                      ? "badge-warning"
                      : "badge-error"
                  }`}
                >
                  {campaign.state === 0
                    ? "Active"
                    : campaign.state === 1
                    ? "Paused"
                    : "Ended"}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  className="btn btn-warning w-full gap-2"
                  disabled={campaign.state !== 0}
                  onClick={() => handleStateChange("pause")}
                >
                  <Pause className="w-4 h-4" />
                  Pause Campaign
                </button>

                <button
                  className="btn btn-success w-full gap-2"
                  disabled={campaign.state !== 1}
                  onClick={() => handleStateChange("resume")}
                >
                  <Play className="w-4 h-4" />
                  Resume Campaign
                </button>

                <button
                  className="btn btn-error w-full gap-2"
                  disabled={campaign.state === 2}
                  onClick={() => handleStateChange("end")}
                >
                  <StopCircle className="w-4 h-4" />
                  End Campaign
                </button>
              </div>
            </div>
          </div>

          {/* Withdraw Funds */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Withdraw Funds
              </h2>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Available Balance</span>
                  <span className="label-text-alt">
                    {campaign.currentBalance} AVAX
                  </span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={campaign.currentBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Amount to withdraw"
                    className="grow"
                  />
                  <span>AVAX</span>
                </label>
              </div>

              <button
                className="btn btn-primary w-full mt-4"
                onClick={handleWithdrawFunds}
                disabled={
                  !withdrawAmount ||
                  Number(withdrawAmount) <= 0 ||
                  Number(withdrawAmount) > Number(campaign.currentBalance)
                }
              >
                Withdraw Funds
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Campaign Section */}
      <motion.div variants={itemVariants} className="mt-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Edit Campaign
            </h2>

            <form
              onSubmit={handleEditCampaign}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  value={editDetails.title}
                  onChange={(e) =>
                    setEditDetails({ ...editDetails, title: e.target.value })
                  }
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Target Amount</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={editDetails.target}
                    onChange={(e) =>
                      setEditDetails({ ...editDetails, target: e.target.value })
                    }
                    className="grow"
                    required
                  />
                  <span>AVAX</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Deadline</span>
                </label>
                <input
                  type="date"
                  value={editDetails.deadline}
                  onChange={(e) =>
                    setEditDetails({ ...editDetails, deadline: e.target.value })
                  }
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Image URL</span>
                </label>
                <input
                  type="url"
                  value={editDetails.image}
                  onChange={(e) =>
                    setEditDetails({ ...editDetails, image: e.target.value })
                  }
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={editDetails.description}
                  onChange={(e) =>
                    setEditDetails({
                      ...editDetails,
                      description: e.target.value,
                    })
                  }
                  className="textarea textarea-bordered"
                  rows={3}
                  required
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <button type="submit" className="btn btn-primary w-full gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ManageCampaign;