import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { useWeb3 } from "../context/Web3Context";
import { motion } from "framer-motion";
import {
  Target,
  Calendar,
  Users,
  Wallet,
  ArrowUpCircle,
  Clock,
} from "lucide-react";

const CampaignDetails = () => {
  const { id } = useParams();
  const { readOnlyContract, contract, account, connectWallet, gasPrice } = useWeb3();
  const [campaign, setCampaign] = useState(null);
  const [donorsList, setDonorsList] = useState([]);
  const [donationAmount, setDonationAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const formatAmount = (amount) => ethers.formatEther(amount);

  const calculateDaysLeft = (deadline) => {
    const deadlineDate = Number(deadline) * 1000;
    const currentTime = Date.now();
    return Math.max(
      0,
      Math.ceil((deadlineDate - currentTime) / (1000 * 60 * 60 * 24))
    );
  };

  const calculateProgress = () => {
    if (!campaign) return 0;
    const raised = Number(formatAmount(campaign.totalRaised));
    const target = Number(formatAmount(campaign.target));
    return Math.min((raised / target) * 100, 100);
  };

  useEffect(() => {
    fetchCampaignDetails();
  }, [readOnlyContract, id]);

  const fetchCampaignDetails = async () => {
    if (!readOnlyContract) return;

    try {
      setIsLoading(true);

      const campaignDetails = await readOnlyContract.getCampaign(Number(id));
      const campaignData = {
        owner: campaignDetails[0],
        title: campaignDetails[1],
        description: campaignDetails[2],
        target: campaignDetails[3],
        deadline: campaignDetails[4],
        totalRaised: campaignDetails[5],
        currentBalance: campaignDetails[6],
        image: campaignDetails[7],
        state: campaignDetails[8],
        donatorCount: campaignDetails[9],
      };

      setCampaign(campaignData);

      const [donorAddresses, donations] = await readOnlyContract.getDonators(
        Number(id)
      );
      const donorList = donorAddresses.map((address, index) => ({
        donor: address,
        amount: ethers.formatEther(donations[index]),
      }));

      setDonorsList(donorList);

      toast.success("Campaign details and donors fetched successfully!");
    } catch (error) {
      console.error("Failed to fetch campaign details or donors:", error);
      toast.error("Failed to fetch campaign details or donors.");
    } finally {
      setIsLoading(false);
    }
  };

  const convertGweiToAvax = (gweiPrice) => {
    if (!gweiPrice) return null;
    const avaxPrice = parseFloat(gweiPrice) * 0.000000001;
    return avaxPrice.toFixed(9);
  };

  const handleDonate = async (e) => {
    e.preventDefault();

    if (!account) {
      await connectWallet();
      toast.success("Wallet connected. Please proceed with your donation.");
      return;
    }

    try {
      const amountInWei = ethers.parseEther(donationAmount);
      const tx = await contract.donateToCampaign(Number(id), {
        value: amountInWei,
      });

      toast.promise(tx.wait(), {
        loading: "Transaction in progress...",
        success: "Donation successful!",
        error: "Donation failed. Please try again.",
      });

      fetchCampaignDetails();
      setDonationAmount("");
    } catch (error) {
      console.error("Donation failed:", error);
      toast.error("Donation failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="alert alert-error">Campaign not found</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <figure className="relative h-[400px]">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-base-100 to-transparent p-6">
                <h1 className="text-3xl font-bold text-base-content">
                  {campaign.title}
                </h1>
              </div>
            </figure>
            <div className="card-body">
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <Wallet size={16} />
                <span>
                  Created by: {campaign.owner.slice(0, 6)}...
                  {campaign.owner.slice(-4)}
                </span>
              </div>
              <p className="text-base-content/80 mt-4">
                {campaign.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
          {/* Campaign Stats */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-base-content/70">Progress</span>
                    <span className="font-bold">
                      {calculateProgress().toFixed(1)}%
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={calculateProgress()}
                    max="100"
                  ></progress>
                </div>

                <div className="stats stats-vertical shadow">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <Target />
                    </div>
                    <div className="stat-title">Target</div>
                    <div className="stat-value text-primary">
                      {formatAmount(campaign.target)} AVAX
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <ArrowUpCircle />
                    </div>
                    <div className="stat-title">Raised</div>
                    <div className="stat-value text-secondary">
                      {formatAmount(campaign.totalRaised)} AVAX
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-figure text-accent">
                      <Clock />
                    </div>
                    <div className="stat-title">Days Left</div>
                    <div className="stat-value text-accent">
                      {calculateDaysLeft(campaign.deadline)}
                    </div>
                  </div>
                </div>


                <div className="stats shadow w-full">
      <div className="stat">
        <div className="stat-figure text-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="stat-title">Estimated Gas Fee</div>
        <div className="stat-value text-info text-2xl">
          {convertGweiToAvax(gasPrice)} AVAX
        </div>
        <div className="stat-desc">Updated in real-time</div>
      </div>
    </div>

                <form onSubmit={handleDonate} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Donation Amount (AVAX)</span>
                    </label>
                    <label className="input input-bordered flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="grow"
                        required
                      />
                      <span>AVAX</span>
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary w-full">
                    {account ? "Make Donation" : "Connect Wallet"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Donors List */}
          <motion.div
            variants={itemVariants}
            className="card bg-base-100 shadow-xl"
          >
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5" />
                <h2 className="card-title">
                  Recent Donors ({donorsList.length})
                </h2>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {donorsList.length > 0 ? (
                  donorsList.map((donor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 bg-base-200 rounded-lg"
                    >
                      <span className="text-sm font-medium">
                        {donor.donor.slice(0, 6)}...{donor.donor.slice(-4)}
                      </span>
                      <span className="badge badge-primary">
                        {donor.amount} AVAX
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-base-content/70 py-4">
                    No donors yet. Be the first one!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CampaignDetails;
