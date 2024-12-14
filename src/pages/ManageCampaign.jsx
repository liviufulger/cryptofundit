import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useWeb3 } from "../context/Web3Context";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { format } from "date-fns";
import {
  Pause,
  Play,
  StopCircle,
  Edit3,
  Save,
  Wallet,
  Target,
  Image as ImageIcon,
  AlertCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
        timestamp: Date.now() - index * 86400000, // Simulated timestamps for demo
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

  // Chart configurations
  const donationChartData = {
    labels: donationHistory
      .map((d) => format(new Date(d.timestamp), "MMM dd"))
      .reverse(),
    datasets: [
      {
        label: "Donation Amount (AVAX)",
        data: donationHistory.map((d) => d.amount).reverse(),
        fill: true,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Donation History",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
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
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Campaign Dashboard
        </h1>
        <p className="text-base-content/70 mt-2">{campaign.title}</p>
      </motion.div>

      {/* Quick Stats - Full Width */}
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
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title">Avg. Donation</div>
          <div className="stat-value text-success">
            {donorStats.averageDonation.toFixed(2)} AVAX
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          {/* Donation History Chart */}
          <motion.div
            variants={itemVariants}
            className="card bg-base-100 shadow-xl"
          >
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Donation History
              </h2>
              <div className="h-[300px]">
                <Line data={donationChartData} options={chartOptions} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Campaign State */}
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

      {/* Edit Campaign Section - Below Chart */}
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
