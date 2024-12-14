// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import { useWeb3 } from '../context/Web3Context';
// import { toast } from 'react-hot-toast';

// const AdminDashboard = () => {
//   const { readOnlyContract, contract, account } = useWeb3();
//   const [campaigns, setCampaigns] = useState([]);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchCampaigns = async () => {
//       if (!readOnlyContract) {
//         console.error('readOnlyContract is not initialized.');
//         return;
//       }

//       try {
//         setIsLoading(true);

//         // Check if the connected account is the contract owner
//         const isOwner = await readOnlyContract.isContractOwner(account);
//         setIsAdmin(isOwner);

//         if (!isOwner) {
//           toast.error('You are not authorized to view this page.');
//           return;
//         }

//         // Fetch all campaigns
//         const campaignCount = await readOnlyContract.numberOfCampaigns();
//         console.log('Total Campaigns:', campaignCount.toString());

//         const campaignPromises = Array.from(
//           { length: Number(campaignCount) },
//           (_, index) => readOnlyContract.getCampaign(index)
//         );

//         const fetchedCampaigns = await Promise.all(campaignPromises);
//         const campaignsData = fetchedCampaigns.map((campaign, index) => ({
//           id: index,
//           title: campaign.title || 'Untitled Campaign',
//           state: Number(campaign.state),
//           owner: campaign.owner,
//           currentBalance: ethers.formatEther(campaign.currentBalance || 0),
//         }));

//         console.log('Fetched Campaigns:', campaignsData);
//         setCampaigns(campaignsData);
//       } catch (error) {
//         console.error('Failed to fetch campaigns:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCampaigns();
//   }, [readOnlyContract, account]);

//   const handleDeleteCampaign = async (id) => {
//     if (!isAdmin) {
//       toast.error('Only the contract owner can delete campaigns.');
//       return;
//     }

//     try {
//       const tx = await contract.deleteCampaign(id);
//       toast.loading('Deleting campaign...');
//       await tx.wait();
//       toast.success('Campaign marked as deleted.');
//       setCampaigns((prev) =>
//         prev.map((campaign) =>
//           campaign.id === id ? { ...campaign, state: 3 } : campaign
//         )
//       ); // Update state to Deleted
//     } catch (error) {
//       console.error('Failed to delete campaign:', error);
//       toast.error('Failed to delete campaign.');
//     }
//   };

//   const handleRestoreCampaign = async (id) => {
//     if (!isAdmin) {
//       toast.error('Only the contract owner can restore campaigns.');
//       return;
//     }

//     try {
//       const tx = await contract.restoreCampaign(id);
//       toast.loading('Restoring campaign...');
//       await tx.wait();
//       toast.success('Campaign restored successfully!');
//       setCampaigns((prev) =>
//         prev.map((campaign) =>
//           campaign.id === id ? { ...campaign, state: 0 } : campaign
//         )
//       ); // Update state to Active
//     } catch (error) {
//       console.error('Failed to restore campaign:', error);
//       toast.error('Failed to restore campaign.');
//     }
//   };

//   if (isLoading) {
//     return <div className="text-center mt-20">Loading campaigns...</div>;
//   }

//   if (!isAdmin) {
//     return <div className="text-center mt-20">You are not authorized to view this page.</div>;
//   }

//   return (
//     <div className="container mx-auto px-4 py-6">
//       <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
//       {campaigns.length === 0 ? (
//         <p className="text-center text-gray-500">No campaigns found.</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {campaigns.map((campaign) => (
//             <div
//               key={campaign.id}
//               className={`border p-4 rounded shadow ${
//                 campaign.state === 3 ? 'bg-red-100' : ''
//               }`}
//             >
//               <h2 className="text-xl font-semibold mb-2">{campaign.title}</h2>
//               <p>
//                 <strong>State:</strong>{' '}
//                 {['Active', 'Paused', 'Ended', 'Deleted'][campaign.state]}
//               </p>
//               <p>
//                 <strong>Owner:</strong> {campaign.owner}
//               </p>
//               <p>
//                 <strong>Balance:</strong> {campaign.currentBalance} AVAX
//               </p>
//               {campaign.state === 3 ? (
//                 <button
//                   onClick={() => handleRestoreCampaign(campaign.id)}
//                   className="btn btn-primary mt-4"
//                 >
//                   Restore Campaign
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => handleDeleteCampaign(campaign.id)}
//                   className="btn btn-danger mt-4"
//                 >
//                   Delete Campaign
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const { readOnlyContract, contract, account } = useWeb3();
  const [campaigns, setCampaigns] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!readOnlyContract) {
        console.error("readOnlyContract is not initialized.");
        return;
      }

      try {
        setIsLoading(true);

        // Check if the connected account is the contract owner
        const isOwner = await readOnlyContract.isContractOwner(account);
        setIsAdmin(isOwner);

        if (!isOwner) {
          toast.error("You are not authorized to view this page.");
          return;
        }

        // Fetch all campaigns
        const campaignCount = await readOnlyContract.numberOfCampaigns();
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
      toast.loading("Deleting campaign...");
      await tx.wait();
      toast.success("Campaign marked as deleted.");
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === id ? { ...campaign, state: 3 } : campaign
        )
      );
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast.error("Failed to delete campaign.");
    }
  };

  const handleRestoreCampaign = async (id) => {
    if (!isAdmin) {
      toast.error("Only the contract owner can restore campaigns.");
      return;
    }

    try {
      const tx = await contract.restoreCampaign(id);
      toast.loading("Restoring campaign...");
      await tx.wait();
      toast.success("Campaign restored successfully!");
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === id ? { ...campaign, state: 0 } : campaign
        )
      );
    } catch (error) {
      console.error("Failed to restore campaign:", error);
      toast.error("Failed to restore campaign.");
    }
  };

  const renderCampaignRow = (title, campaigns, actionButtons) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-black mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`card shadow-xl ${
                campaign.state === 3 ? "bg-red-100" : "bg-white"
              }`}
            >
              <div className="card-body">
                <h3 className="card-title text-lg text-gray-800 truncate">
                  {campaign.title}
                </h3>
                <p className="text-gray-600">
                  <strong>Owner:</strong> {campaign.owner}
                </p>
                <p className="text-gray-600">
                  <strong>Balance:</strong> {campaign.currentBalance} AVAX
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  {actionButtons(campaign)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No campaigns found in this state.</p>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center mt-20">
        <div className="alert alert-error shadow-lg">
          <div>
            <span>You are not authorized to view this page.</span>
          </div>
        </div>
      </div>
    );
  }

  const activeCampaigns = campaigns.filter((c) => c.state === 0);
  const pausedCampaigns = campaigns.filter((c) => c.state === 1);
  const endedCampaigns = campaigns.filter((c) => c.state === 2);
  const deletedCampaigns = campaigns.filter((c) => c.state === 3);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-black-800 dark:text-black mb-6">
        Admin Dashboard
      </h1>

      {renderCampaignRow("Active Campaigns", activeCampaigns, (campaign) => (
        <button
          onClick={() => handleDeleteCampaign(campaign.id)}
          className="btn btn-error btn-sm"
        >
          Delete Campaign
        </button>
      ))}

      {renderCampaignRow("Paused Campaigns", pausedCampaigns, (campaign) => (
        <button
          onClick={() => handleDeleteCampaign(campaign.id)}
          className="btn btn-error btn-sm"
        >
          Delete Campaign
        </button>
      ))}

      {renderCampaignRow("Ended Campaigns", endedCampaigns, () => (
        <span className="badge badge-outline badge-warning">
          No actions available
        </span>
      ))}

      {renderCampaignRow("Deleted Campaigns", deletedCampaigns, (campaign) => (
        <button
          onClick={() => handleRestoreCampaign(campaign.id)}
          className="btn btn-primary btn-sm"
        >
          Restore Campaign
        </button>
      ))}
    </div>
  );
};

export default AdminDashboard;
