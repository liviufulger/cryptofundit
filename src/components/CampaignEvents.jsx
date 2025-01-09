import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { Activity, ArrowUpRight, Gift, Pause, Play, Trash2, Upload, Download, RefreshCw } from 'lucide-react';

const START_BLOCK = 37388313;  
const CHUNK_SIZE = 2000;

async function chunkedQueryFilter(contract, filter, startBlock, endBlock) {
  let allEvents = [];
  let current = startBlock;

  const provider = contract.runner; 
  if (!provider) {
    console.error('No runner found on contract');
    return [];
  }

  while (current <= endBlock) {
    const chunkEnd = Math.min(current + CHUNK_SIZE - 1, endBlock);
    const events = await contract.queryFilter(filter, current, chunkEnd);
    allEvents = allEvents.concat(events);
    current = chunkEnd + 1;
  }
  return allEvents;
}

const CampaignEvents = ({ campaignId }) => {
  const [campaignEvents, setCampaignEvents] = useState([]);
  const { readOnlyContract } = useWeb3();

  useEffect(() => {
    // Bail out if contract not ready
    if (!readOnlyContract) return;

    const provider = readOnlyContract.runner;
    if (!provider) {
      console.error('No runner (provider) on readOnlyContract!');
      return;
    }

    // CampaignCreated
    readOnlyContract.on("CampaignCreated", (id, owner, title, target, deadline, event) => {
      if (id.toString() === campaignId.toString()) {
        const newEvent = {
          type: 'Created',
          id: id.toString(),
          owner,
          title,
          target: ethers.formatEther(target),
          deadline: new Date(Number(deadline) * 1000).toLocaleString(),
          timestamp: Date.now(),
          transactionHash: event.transactionHash,
        };
        setCampaignEvents(prev => [newEvent, ...prev]);
      }
    });

    // DonationReceived
    readOnlyContract.on("DonationReceived", (id, donator, amount, event) => {
      if (id.toString() === campaignId.toString()) {
        const newEvent = {
          type: 'Donation',
          donator,
          amount: ethers.formatEther(amount),
          timestamp: Date.now(),
          transactionHash: event.transactionHash,
        };
        setCampaignEvents(prev => [newEvent, ...prev]);
      }
    });

    // FundsWithdrawn
    readOnlyContract.on("FundsWithdrawn", (id, owner, amount, event) => {
      if (id.toString() === campaignId.toString()) {
        const newEvent = {
          type: 'Withdrawal',
          owner,
          amount: ethers.formatEther(amount),
          timestamp: Date.now(),
          transactionHash: event.transactionHash,
        };
        setCampaignEvents(prev => [newEvent, ...prev]);
      }
    });

    // CampaignPaused
    readOnlyContract.on("CampaignPaused", (id, event) => {
      if (id.toString() === campaignId.toString()) {
        const newEvent = {
          type: 'Paused',
          timestamp: Date.now(),
          transactionHash: event.transactionHash,
        };
        setCampaignEvents(prev => [newEvent, ...prev]);
      }
    });

    // CampaignResumed
    readOnlyContract.on("CampaignResumed", (id, event) => {
      if (id.toString() === campaignId.toString()) {
        const newEvent = {
          type: 'Resumed',
          timestamp: Date.now(),
          transactionHash: event.transactionHash,
        };
        setCampaignEvents(prev => [newEvent, ...prev]);
      }
    });

    // CampaignCompleted
    readOnlyContract.on("CampaignCompleted", (id, totalRaised, event) => {
      if (id.toString() === campaignId.toString()) {
        const newEvent = {
          type: 'Completed',
          totalRaised: ethers.formatEther(totalRaised),
          timestamp: Date.now(),
          transactionHash: event.transactionHash,
        };
        setCampaignEvents(prev => [newEvent, ...prev]);
      }
    });

    // CampaignUpdated
    readOnlyContract.on(
      "CampaignUpdated",
      (id, title, description, target, deadline, image, event) => {
        if (id.toString() === campaignId.toString()) {
          const newEvent = {
            type: 'Updated',
            title,
            description,
            target: ethers.formatEther(target),
            deadline: new Date(Number(deadline) * 1000).toLocaleString(),
            timestamp: Date.now(),
            transactionHash: event.transactionHash,
          };
          setCampaignEvents(prev => [newEvent, ...prev]);
        }
      }
    );

    // CampaignDeleted
    readOnlyContract.on("CampaignDeleted", (id, deletedBy, event) => {
      if (id.toString() === campaignId.toString()) {
        const newEvent = {
          type: 'Deleted',
          deletedBy,
          timestamp: Date.now(),
          transactionHash: event.transactionHash,
        };
        setCampaignEvents(prev => [newEvent, ...prev]);
      }
    });



    (async function fetchPastEvents() {
      try {
        const latestBlock = await provider.getBlockNumber();

        // Create filters for each event type
        const createdFilter    = readOnlyContract.filters.CampaignCreated(campaignId);
        const donationFilter   = readOnlyContract.filters.DonationReceived(campaignId);
        const withdrawalFilter = readOnlyContract.filters.FundsWithdrawn(campaignId);
        const pausedFilter     = readOnlyContract.filters.CampaignPaused(campaignId);
        const resumedFilter    = readOnlyContract.filters.CampaignResumed(campaignId);
        const completedFilter  = readOnlyContract.filters.CampaignCompleted(campaignId);
        const updatedFilter    = readOnlyContract.filters.CampaignUpdated(campaignId);
        const deletedFilter    = readOnlyContract.filters.CampaignDeleted(campaignId);

        const [
          created,
          donations,
          withdrawals,
          paused,
          resumed,
          completed,
          updated,
          deleted,
        ] = await Promise.all([
          chunkedQueryFilter(readOnlyContract, createdFilter,    START_BLOCK, latestBlock),
          chunkedQueryFilter(readOnlyContract, donationFilter,   START_BLOCK, latestBlock),
          chunkedQueryFilter(readOnlyContract, withdrawalFilter, START_BLOCK, latestBlock),
          chunkedQueryFilter(readOnlyContract, pausedFilter,     START_BLOCK, latestBlock),
          chunkedQueryFilter(readOnlyContract, resumedFilter,    START_BLOCK, latestBlock),
          chunkedQueryFilter(readOnlyContract, completedFilter,  START_BLOCK, latestBlock),
          chunkedQueryFilter(readOnlyContract, updatedFilter,    START_BLOCK, latestBlock),
          chunkedQueryFilter(readOnlyContract, deletedFilter,    START_BLOCK, latestBlock),
        ]);

        // Format & combine
        const allEvents = [
          ...created.map(e => ({
            type: 'Created',
            id: e.args.id.toString(),
            owner: e.args.owner,
            title: e.args.title,
            target: ethers.formatEther(e.args.target),
            deadline: new Date(Number(e.args.deadline) * 1000).toLocaleString(),
            timestamp: e.blockNumber,
            transactionHash: e.transactionHash,
          })),
          ...donations.map(e => ({
            type: 'Donation',
            donator: e.args.donator,
            amount: ethers.formatEther(e.args.amount),
            timestamp: e.blockNumber,
            transactionHash: e.transactionHash,
          })),
          ...withdrawals.map(e => ({
            type: 'Withdrawal',
            owner: e.args.owner,
            amount: ethers.formatEther(e.args.amount),
            timestamp: e.blockNumber,
            transactionHash: e.transactionHash,
          })),
          ...paused.map(e => ({
            type: 'Paused',
            timestamp: e.blockNumber,
            transactionHash: e.transactionHash,
          })),
          ...resumed.map(e => ({
            type: 'Resumed',
            timestamp: e.blockNumber,
            transactionHash: e.transactionHash,
          })),
          ...completed.map(e => ({
            type: 'Completed',
            totalRaised: ethers.formatEther(e.args.totalRaised),
            timestamp: e.blockNumber,
            transactionHash: e.transactionHash,
          })),
          ...updated.map(e => ({
            type: 'Updated',
            title: e.args.title,
            description: e.args.description,
            target: ethers.formatEther(e.args.target),
            deadline: new Date(Number(e.args.deadline) * 1000).toLocaleString(),
            timestamp: e.blockNumber,
            transactionHash: e.transactionHash,
          })),
          ...deleted.map(e => ({
            type: 'Deleted',
            deletedBy: e.args.deletedBy,
            timestamp: e.blockNumber,
            transactionHash: e.transactionHash,
          })),
        ].sort((a, b) => b.timestamp - a.timestamp); // sort descending

        setCampaignEvents(allEvents);
      } catch (error) {
        console.error('Error loading past events:', error);
      }
    })();

    // Cleanup all listeners on unmount
    return () => {
      readOnlyContract.removeAllListeners("CampaignCreated");
      readOnlyContract.removeAllListeners("DonationReceived");
      readOnlyContract.removeAllListeners("FundsWithdrawn");
      readOnlyContract.removeAllListeners("CampaignPaused");
      readOnlyContract.removeAllListeners("CampaignResumed");
      readOnlyContract.removeAllListeners("CampaignCompleted");
      readOnlyContract.removeAllListeners("CampaignUpdated");
      readOnlyContract.removeAllListeners("CampaignDeleted");
    };
  }, [readOnlyContract, campaignId]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'Created': return <Activity className="w-5 h-5 text-green-500" />;
      case 'Donation': return <Gift className="w-5 h-5 text-purple-500" />;
      case 'Withdrawal': return <Download className="w-5 h-5 text-orange-500" />;
      case 'Paused': return <Pause className="w-5 h-5 text-red-500" />;
      case 'Resumed': return <Play className="w-5 h-5 text-green-500" />;
      case 'Completed': return <Upload className="w-5 h-5 text-blue-500" />;
      case 'Updated': return <RefreshCw className="w-5 h-5 text-yellow-500" />;
      case 'Deleted': return <Trash2 className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const formatAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  const getEventTitle = (type) => {
    const titles = {
      'Created': 'Campaign Created',
      'Donation': 'New Donation',
      'Withdrawal': 'Funds Withdrawn',
      'Paused': 'Campaign Paused',
      'Resumed': 'Campaign Resumed',
      'Completed': 'Campaign Completed',
      'Updated': 'Campaign Updated',
      'Deleted': 'Campaign Deleted'
    };
    return titles[type] || type;
  };

  const renderEventDetails = (event) => {
    switch (event.type) {
      case 'Created':
        return `${event.title} • Owner: ${formatAddress(event.owner)} • Target: ${event.target} AVAX`;
      case 'Donation':
        return `${event.amount} AVAX from ${formatAddress(event.donator)}`;
      case 'Withdrawal':
        return `${event.amount} AVAX by ${formatAddress(event.owner)}`;
      case 'Completed':
        return `Total raised: ${event.totalRaised} AVAX`;
      case 'Updated':
        return `${event.title} • Target: ${event.target} AVAX`;
      case 'Deleted':
        return `By: ${formatAddress(event.deletedBy)}`;
      default:
        return '';
    }
  };

  return (
    <div className="w-[70%] mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Latest Transactions
          </h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {campaignEvents.slice(0, 10).map((event, index) => (
            <div
              key={`${event.transactionHash}-${index}`}
              className="px-4 py-2.5 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center gap-3">
                <div>{getEventIcon(event.type)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">{getEventTitle(event.type)}</span>
                    <span className="text-gray-500 ">    {renderEventDetails(event)}</span>
                  </div>
                </div>

                <a
                  href={`https://testnet.snowtrace.io/tx/${event.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 shrink-0"
                >
                  View
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignEvents;



