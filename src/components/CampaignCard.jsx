import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  BadgeCheck, 
  DollarSign, 
  Clock, 
  Info 
} from 'lucide-react';

// Utility functions extracted for reusability and cleaner code
const formatAmount = (amount, decimals = 2) => {
  try {
    return amount ? Number(ethers.formatEther(amount)).toFixed(decimals) : '0';
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0';
  }
};

const formatDate = (timestamp) => {
  if (!timestamp || isNaN(timestamp)) {
    return "No Deadline";
  }

  try {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const CampaignCard = ({ campaign }) => {
  const [donationAmount, setDonationAmount] = useState('');
  const { contract, account } = useWeb3();
  const [loading, setLoading] = useState(false);

  // Memoized calculations to improve performance
  const campaignDetails = useMemo(() => {
    const target = Number(formatAmount(campaign.target, 2));
    const raised = Number(formatAmount(campaign.totalRaised, 2));
    const progress = Math.min((raised / target) * 100, 100);
    
    return {
      target,
      raised,
      progress,
      daysLeft: campaign.deadline 
        ? Math.max(0, Math.ceil((campaign.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0
    };
  }, [campaign]);

  // State color mapping for improved readability
  const STATE_COLORS = {
    0: { 
      bg: 'bg-green-100 text-green-800', 
      icon: <BadgeCheck className="mr-1 h-4 w-4 text-green-600" /> 
    },
    1: { 
      bg: 'bg-yellow-100 text-yellow-800', 
      icon: <Clock className="mr-1 h-4 w-4 text-yellow-600" /> 
    },
    2: { 
      bg: 'bg-gray-100 text-gray-800', 
      icon: <Info className="mr-1 h-4 w-4 text-gray-600" /> 
    },
    3: { 
      bg: 'bg-red-100 text-red-800', 
      icon: null 
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.donateToCampaign(campaign.id, {
        value: ethers.parseEther(donationAmount),
      });
      toast.loading('Processing donation...');
      await tx.wait();
      toast.success('Donation successful!');
      setDonationAmount('');
    } catch (error) {
      toast.error(error.message || 'Donation failed');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if campaign is deleted
  if (campaign.state === 3) return null;

  const { bg: stateBgColor, icon: stateIcon } = STATE_COLORS[campaign.state] || STATE_COLORS[2];

  return (
    <div className="group relative">
      <Link 
        to={`/campaign/${campaign.id}`} 
        className="block transform transition-all duration-300 hover:-translate-y-2"
      >
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
          {/* Campaign Image */}
          <div className="relative h-48 overflow-hidden rounded-t-xl">
            <img
              src={campaign.image}
              alt={campaign.title || 'Untitled Campaign'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400';
                e.target.alt = 'Placeholder Image';
              }}
            />
            
            {/* Campaign State Badge */}
            <div className="absolute top-4 left-4">
              <span className={`${stateBgColor} text-xs font-medium px-3 py-1 rounded-full flex items-center`}>
                {stateIcon}
                {['Active', 'Paused', 'Ended', 'Deleted'][campaign.state]}
              </span>
            </div>

            {/* Funding Progress */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
              <p className="text-white text-sm font-medium flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                {formatAmount(campaign.totalRaised)} / {formatAmount(campaign.target)} AVAX
              </p>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {campaign.title || 'Untitled Campaign'}
            </h2>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {campaign.description || 'No description provided.'}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary rounded-full h-3 transition-all duration-300"
                  style={{ width: `${campaignDetails.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{campaignDetails.progress.toFixed(0)}% Funded</span>
                <span>{formatAmount(campaign.target)} AVAX Goal</span>
              </div>
            </div>

            {/* Campaign Meta */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                <span>{formatDate(campaign.deadline)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span>{campaign.donatorCount || 0} donors</span>
              </div>
            </div>

            {/* Days Left */}
            {campaignDetails.daysLeft > 0 && (
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-secondary" />
                {campaignDetails.daysLeft} {campaignDetails.daysLeft === 1 ? 'day' : 'days'} left
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Optional: Donate Modal or Inline Donation (commented out for now) */}
      {/* {showDonateModal && (
        <DonationModal 
          campaign={campaign} 
          onClose={() => setShowDonateModal(false)}
        />
      )} */}
    </div>
  );
};

export default CampaignCard;