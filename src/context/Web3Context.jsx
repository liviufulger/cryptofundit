// import { contractABI, contractAddress } from '../constants';
// import React, { useState, useEffect, createContext, useContext } from 'react';
// import { ethers } from 'ethers';

// const Web3Context = createContext();

// export const Web3Provider = ({ children }) => {
//   const [account, setAccount] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [readOnlyContract, setReadOnlyContract] = useState(null);
//   const [signer, setSigner] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [balance, setBalance] = useState(null);


//   // Initialize read-only provider
//   useEffect(() => {
//     const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
//     const readOnlyContractInstance = new ethers.Contract(
//       contractAddress,
//       contractABI,
//       provider
//     );
//     setReadOnlyContract(readOnlyContractInstance);
//   }, []);

//   const connectWallet = async () => {
//     try {
//       if (!window.ethereum) {
//         throw new Error('MetaMask not detected');
//       }
//       await window.ethereum.request({ method: 'eth_requestAccounts' });

//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const currentSigner = await provider.getSigner();
//       const userAddress = await currentSigner.getAddress();
//       const balance = await provider.getBalance(userAddress);
      

//       setAccount(userAddress);
//       setSigner(currentSigner);
//       setIsConnected(true);
//       setBalance(ethers.formatEther(balance));
     

//       const cryptoFunditContract = new ethers.Contract(
//         contractAddress,
//         contractABI,
//         currentSigner
//       );
//       setContract(cryptoFunditContract);
//     } catch (error) {
//       console.error('Wallet connection failed', error);
//       setIsConnected(false);
//     }
//   };

//   const disconnectWallet = () => {
//     setAccount(null);
//     setSigner(null);
//     setContract(null);
//     setIsConnected(false);
//     setBalance(null);
  
//   };

//   return (
//     <Web3Context.Provider
//       value={{
//         account,
//         contract,
//         readOnlyContract,
//         signer,
//         isConnected,
//         balance,
//         connectWallet,
//         disconnectWallet,
//       }}
//     >
//       {children}
//     </Web3Context.Provider>
//   );
// };

// export const useWeb3 = () => useContext(Web3Context);


// import { contractABI, contractAddress } from '../constants';
// import React, { useState, useEffect, createContext, useContext } from 'react';
// import { ethers } from 'ethers';

// const Web3Context = createContext();

// export const Web3Provider = ({ children }) => {
//   const [account, setAccount] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [readOnlyContract, setReadOnlyContract] = useState(null);
//   const [signer, setSigner] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [balance, setBalance] = useState(null);
//   const [walletError, setWalletError] = useState(null);

//   // Initialize read-only provider
//   useEffect(() => {
//     const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
//     const readOnlyContractInstance = new ethers.Contract(
//       contractAddress,
//       contractABI,
//       provider
//     );
//     setReadOnlyContract(readOnlyContractInstance);
//   }, []);

//   const connectWallet = async () => {
//     try {
//       // Check if Ethereum provider exists
//       if (!window.ethereum) {
//         // Set a specific error for no wallet
//         setWalletError({
//           type: 'no_wallet',
//           message: 'No Ethereum wallet detected. Please install MetaMask.'
//         });
//         return;
//       }

//       // Clear any previous errors
//       setWalletError(null);

//       // Request account access
//       await window.ethereum.request({ method: 'eth_requestAccounts' });
      
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const currentSigner = await provider.getSigner();
//       const userAddress = await currentSigner.getAddress();
//       const balance = await provider.getBalance(userAddress);

//       setAccount(userAddress);
//       setSigner(currentSigner);
//       setIsConnected(true);
//       setBalance(ethers.formatEther(balance));

//       const cryptoFunditContract = new ethers.Contract(
//         contractAddress,
//         contractABI,
//         currentSigner
//       );
//       setContract(cryptoFunditContract);
//     } catch (error) {
//       console.error('Wallet connection failed', error);
      
//       // Differentiate between different types of errors
//       if (error.code === 4001) {
//         // User rejected the request
//         setWalletError({
//           type: 'user_rejected',
//           message: 'Connection request was rejected. Please try again.'
//         });
//       } else {
//         setWalletError({
//           type: 'connection_error',
//           message: 'Failed to connect wallet. Please try again.'
//         });
//       }
      
//       setIsConnected(false);
//     }
//   };

//   const disconnectWallet = () => {
//     setAccount(null);
//     setSigner(null);
//     setContract(null);
//     setIsConnected(false);
//     setBalance(null);
//     setWalletError(null);
//   };

//   const installWalletInstructions = () => {
//     // Direct users to MetaMask download page
//     window.open('https://metamask.io/download.html', '_blank');
//   };

//   return (
//     <Web3Context.Provider
//       value={{
//         account,
//         contract,
//         readOnlyContract,
//         signer,
//         isConnected,
//         balance,
//         connectWallet,
//         disconnectWallet,
//         walletError,
//         installWalletInstructions
//       }}
//     >
//       {children}
//     </Web3Context.Provider>
//   );
// };

// export const useWeb3 = () => useContext(Web3Context);


import { contractABI, contractAddress } from '../constants';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [readOnlyContract, setReadOnlyContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(null);
  const [walletError, setWalletError] = useState(null);

  // Initialize read-only provider
  useEffect(() => {
    const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
    const readOnlyContractInstance = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );
    setReadOnlyContract(readOnlyContractInstance);
  }, []);

  // Check for saved connection on component mount
  useEffect(() => {
    const savedAccount = localStorage.getItem('walletAccount');
    if (savedAccount) {
      reconnectWallet();
    }
  }, []);

  const reconnectWallet = async () => {
    try {
      // Check if Ethereum provider exists
      if (!window.ethereum) {
        localStorage.removeItem('walletAccount');
        return;
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const currentSigner = await provider.getSigner();
      const userAddress = await currentSigner.getAddress();
      
      // Verify the saved account matches the current account
      const savedAccount = localStorage.getItem('walletAccount');
      if (savedAccount && savedAccount.toLowerCase() !== userAddress.toLowerCase()) {
        localStorage.removeItem('walletAccount');
        return;
      }

      const balance = await provider.getBalance(userAddress);

      setAccount(userAddress);
      setSigner(currentSigner);
      setIsConnected(true);
      setBalance(ethers.formatEther(balance));

      const cryptoFunditContract = new ethers.Contract(
        contractAddress,
        contractABI,
        currentSigner
      );
      setContract(cryptoFunditContract);
    } catch (error) {
      console.error('Wallet reconnection failed', error);
      localStorage.removeItem('walletAccount');
      setIsConnected(false);
    }
  };

  const connectWallet = async () => {
    try {
      // Check if Ethereum provider exists
      if (!window.ethereum) {
        setWalletError({
          type: 'no_wallet',
          message: 'No Ethereum wallet detected. Please install MetaMask.'
        });
        return;
      }

      // Clear any previous errors
      setWalletError(null);

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const currentSigner = await provider.getSigner();
      const userAddress = await currentSigner.getAddress();
      const balance = await provider.getBalance(userAddress);

      // Save account to local storage
      localStorage.setItem('walletAccount', userAddress);

      setAccount(userAddress);
      setSigner(currentSigner);
      setIsConnected(true);
      setBalance(ethers.formatEther(balance));

      const cryptoFunditContract = new ethers.Contract(
        contractAddress,
        contractABI,
        currentSigner
      );
      setContract(cryptoFunditContract);
    } catch (error) {
      console.error('Wallet connection failed', error);
      
      // Differentiate between different types of errors
      if (error.code === 4001) {
        // User rejected the request
        setWalletError({
          type: 'user_rejected',
          message: 'Connection request was rejected. Please try again.'
        });
      } else {
        setWalletError({
          type: 'connection_error',
          message: 'Failed to connect wallet. Please try again.'
        });
      }
      
      setIsConnected(false);
    }
  };

  const disconnectWallet = () => {
    // Remove saved account from local storage
    localStorage.removeItem('walletAccount');

    setAccount(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
    setBalance(null);
    setWalletError(null);
  };

  const installWalletInstructions = () => {
    // Direct users to MetaMask download page
    window.open('https://metamask.io/download.html', '_blank');
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        contract,
        readOnlyContract,
        signer,
        isConnected,
        balance,
        connectWallet,
        disconnectWallet,
        walletError,
        installWalletInstructions
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);