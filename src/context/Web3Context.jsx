import React, { useState, useEffect, createContext, useContext } from 'react';
import { ethers } from 'ethers';
import { MetaMaskSDK } from '@metamask/sdk';
import { contractABI, contractAddress } from '../constants';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [readOnlyContract, setReadOnlyContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(null);
  const [walletError, setWalletError] = useState(null);
  const [sdk, setSDK] = useState(null);
  const [connectionMethod, setConnectionMethod] = useState(null);

  // Initialize providers and SDK
  useEffect(() => {
    // Initialize read-only provider for Avalanche Testnet
    const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
    const readOnlyContractInstance = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );
    setReadOnlyContract(readOnlyContractInstance);

    // Initialize MetaMask SDK
    const metamaskSDK = new MetaMaskSDK({
      dappMetadata: {
        name: "CryptoFundit",
        url: window.location.origin,
      },
      checkInstallationImmediately: false,
      dappUrl: window.location.origin,
      chainId: 43113, // Avalanche Fuji Testnet
    });

    setSDK(metamaskSDK);

    // Check for saved connection on component mount
    const savedAccount = localStorage.getItem('walletAccount');
    const savedConnectionMethod = localStorage.getItem('connectionMethod');

    if (savedAccount && savedConnectionMethod) {
      if (savedConnectionMethod === 'metamask') {
        reconnectWalletMetamask();
      } else {
        reconnectWallet();
      }
    }

    // Cleanup
    return () => {
      metamaskSDK.terminate();
    };
  }, []);

  // Common contract setup function
  const setupContract = async (provider, currentSigner) => {
    try {
      const contractInstance = currentSigner
        ? new ethers.Contract(contractAddress, contractABI, currentSigner)
        : new ethers.Contract(contractAddress, contractABI, provider);
      
      return contractInstance;
    } catch (error) {
      console.error('Contract setup failed', error);
      return null;
    }
  };

  // Common connection logic
  const handleConnection = async (userAddress, provider, currentSigner, method) => {
    try {
      const balance = await provider.getBalance(userAddress);

      // Save connection details
      localStorage.setItem('walletAccount', userAddress);
      if (method) {
        localStorage.setItem('connectionMethod', method);
      }

      setAccount(userAddress);
      setSigner(currentSigner || null);
      setIsConnected(true);
      setBalance(ethers.formatEther(balance));
      setConnectionMethod(method || null);

      // Setup contract
      const contractInstance = await setupContract(provider, currentSigner);
      setContract(contractInstance);

      return true;
    } catch (error) {
      console.error('Connection handling failed', error);
      return false;
    }
  };

  // Browser Provider Connection
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setWalletError({
          type: 'no_wallet',
          message: 'No Ethereum wallet detected. Please install MetaMask.'
        });
        return;
      }

      setWalletError(null);

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const currentSigner = await provider.getSigner();
      const userAddress = await currentSigner.getAddress();

      await handleConnection(userAddress, provider, currentSigner, 'browser');
    } catch (error) {
      handleConnectionError(error);
    }
  };

  // MetaMask SDK Connection
  const connectWalletMetamask = async () => {
    try {
      if (!sdk) {
        setWalletError({
          type: 'sdk_not_initialized',
          message: 'MetaMask SDK not initialized.'
        });
        return;
      }

      setWalletError(null);

      // Request account access using SDK
      const accounts = await sdk.connect();

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      const provider = new ethers.BrowserProvider(sdk.getProvider());
      const currentSigner = await provider.getSigner();
      const userAddress = await currentSigner.getAddress();

      await handleConnection(userAddress, provider, currentSigner, 'metamask');
    } catch (error) {
      handleConnectionError(error);
    }
  };

  // Centralized error handling
  const handleConnectionError = (error) => {
    console.error('Wallet connection failed', error);
    
    const errorHandlers = {
      4001: () => ({
        type: 'user_rejected',
        message: 'Connection request was rejected. Please try again.'
      }),
      'no_wallet': () => ({
        type: 'no_wallet',
        message: 'MetaMask is not installed. Please install MetaMask.'
      }),
      default: () => ({
        type: 'connection_error',
        message: 'Failed to connect wallet. Please try again.'
      })
    };

    const errorHandler = errorHandlers[error.code] || errorHandlers['default'];
    setWalletError(errorHandler());
    setIsConnected(false);
  };

  // Disconnection methods
  const disconnectWallet = () => {
    localStorage.removeItem('walletAccount');
    localStorage.removeItem('connectionMethod');

    if (connectionMethod === 'metamask' && sdk) {
      sdk.terminate();
    }

    setAccount(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
    setBalance(null);
    setWalletError(null);
    setConnectionMethod(null);
  };

  // Reconnection methods (similar to previous implementation)
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

      await handleConnection(userAddress, provider, currentSigner, 'browser');
    } catch (error) {
      console.error('Wallet reconnection failed', error);
      localStorage.removeItem('walletAccount');
      setIsConnected(false);
    }
  };

  const reconnectWalletMetamask = async () => { 
    try {
      if (!sdk) return;

      // Attempt to connect to the previously connected account
      const savedAccount = localStorage.getItem('walletAccount');
      if (!savedAccount) return;

      // Attempt to get the provider
      const provider = new ethers.BrowserProvider(sdk.getProvider());
      const currentSigner = await provider.getSigner();
      const userAddress = await currentSigner.getAddress();

      // Verify the saved account matches the current account
      if (savedAccount.toLowerCase() !== userAddress.toLowerCase()) {
        localStorage.removeItem('walletAccount');
        return;
      }

      await handleConnection(userAddress, provider, currentSigner, 'metamask');
    } catch (error) {
      console.error('Wallet reconnection failed', error);
      localStorage.removeItem('walletAccount');
      setIsConnected(false);
    }
  };

  const installWalletInstructions = () => {
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
        connectWalletMetamask,
        walletError,
        installWalletInstructions,
        sdk,
        connectionMethod
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);