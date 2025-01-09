import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';


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


  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Latest Transactions</h2>
      <div className="space-y-2">
        {campaignEvents.map((event, index) => (
          <div
            key={`${event.transactionHash}-${index}`}
            className="p-4 bg-white rounded-lg shadow"
          >
            {/* Render based on event.type */}
            {event.type === 'Created' && (
              <p>
                <span className="font-semibold">Campaign Created</span><br/>
                <span className="font-medium">Title:</span> {event.title}<br/>
                <span className="font-medium">Owner:</span> {event.owner?.slice(0,6)}...{event.owner?.slice(-4)}<br/>
                <span className="font-medium">Target:</span> {event.target} AVAX<br/>
                <span className="font-medium">Deadline:</span> {event.deadline}
              </p>
            )}

            {event.type === 'Donation' && (
              <p>
                <span className="font-semibold">Donation:</span> {event.amount} AVAX 
                from {event.donator?.slice(0, 6)}...{event.donator?.slice(-4)}
              </p>
            )}

            {event.type === 'Withdrawal' && (
              <p>
                <span className="font-semibold">Withdrawal:</span> {event.amount} AVAX 
                by {event.owner?.slice(0, 6)}...{event.owner?.slice(-4)}
              </p>
            )}

            {event.type === 'Paused' && (
              <p>
                <span className="font-semibold">Campaign Paused</span>
              </p>
            )}

            {event.type === 'Resumed' && (
              <p>
                <span className="font-semibold">Campaign Resumed</span>
              </p>
            )}

            {event.type === 'Completed' && (
              <p>
                <span className="font-semibold">Campaign Completed</span> 
                with total raised: {event.totalRaised} AVAX
              </p>
            )}

            {event.type === 'Updated' && (
              <p>
                <span className="font-semibold">Campaign Updated</span><br/>
                <span className="font-medium">Title:</span> {event.title}<br/>
                <span className="font-medium">Description:</span> {event.description}<br/>
                <span className="font-medium">Target:</span> {event.target} AVAX<br/>
                <span className="font-medium">Deadline:</span> {event.deadline}
              </p>
            )}

            {event.type === 'Deleted' && (
              <p>
                <span className="font-semibold">Campaign Deleted</span><br/>
                <span className="font-medium">Deleted By:</span> {event.deletedBy?.slice(0,6)}...{event.deletedBy?.slice(-4)}
              </p>
            )}

            {/* Link to the transaction */}
            <a
              href={`https://testnet.snowtrace.io/tx/${event.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-700 block mt-2"
            >
              View transaction
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignEvents;

