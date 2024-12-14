import { ethers } from 'ethers';

export const convertToUnixTimestamp = (dateString) => {
  return Math.floor(new Date(dateString).getTime() / 1000);
};

export const convertToAVAX = (amount) => {
  return ethers.parseEther(amount.toString());
};

export const getMinDate = () => {
  const today = new Date();
  today.setDate(today.getDate() + 1); // Minimum 1 day from now
  return today.toISOString().split('T')[0];
};