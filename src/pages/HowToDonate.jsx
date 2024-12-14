import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  CreditCard,
  Network,
  DollarSign,
  CheckCircle,
} from "lucide-react";

const StepCard = ({
  stepNumber,
  title,
  description,
  steps,
  icon: Icon,
  isActive,
  onClick,
}) => (
  <div
    className={`
      card ${
        isActive
          ? "border-2 border-primary shadow-xl"
          : "border-2 border-transparent"
      }
      bg-base-100 transition-all duration-300 hover:border-primary
      cursor-pointer
    `}
    onClick={onClick}
  >
    <div className="card-body">
      <div className="flex items-center space-x-4">
        <div
          className={`
            avatar placeholder
            ${isActive ? "online" : "offline"}
          `}
        >
          <div
            className={`
            w-16 rounded-full 
            ${isActive ? "bg-primary text-primary-content" : "bg-base-200"}
          `}
          >
            <span className="text-xl">{stepNumber}</span>
          </div>
        </div>
        <div className="flex-grow">
          <h3
            className={`
            text-2xl font-bold 
            ${isActive ? "text-primary" : "text-base-content"}
          `}
          >
            {title}
          </h3>
        </div>
        <Icon
          className={`
          w-8 h-8 
          ${isActive ? "text-primary" : "text-base-300"}
        `}
        />
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <p className="text-base-content/70 mb-4">{description}</p>
            <ul className="space-y-3">
              {steps.map((step, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center text-base-content"
                >
                  <CheckCircle className="mr-3 text-success" size={20} />
                  <span dangerouslySetInnerHTML={{ __html: step }} />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

const HowToDonate = () => {
  const [activeStep, setActiveStep] = useState(1);

  const donationSteps = [
    {
      number: 1,
      title: "Buy AVAX from Exchange",
      description:
        "Purchase AVAX tokens from a centralized cryptocurrency exchange.",
      icon: CreditCard,
      steps: [
        "Create an account on <strong>Binance</strong>, <strong>Coinbase</strong>, or <strong>Kraken</strong>",
        "Complete KYC (Know Your Customer) verification",
        "Deposit funds via bank transfer or credit card",
        "Navigate to trading section and buy AVAX tokens",
      ],
    },
    {
      number: 2,
      title: "Set Up MetaMask Wallet",
      description:
        "Create a secure wallet to manage and transfer your AVAX tokens.",
      icon: Wallet,
      steps: [
        'Download MetaMask from <a href="https://metamask.io" class="link link-primary" target="_blank">metamask.io</a>',
        "Install browser extension or mobile app",
        "Create a new wallet and securely store your seed phrase",
        "Add Avalanche network to MetaMask",
      ],
    },
    {
      number: 3,
      title: "Connect Wallet to CryptoFundit",
      description:
        "Link your MetaMask wallet to start donating on our platform.",
      icon: Network,
      steps: [
        "Visit <strong>CryptoFundit.com</strong>",
        'Click "Connect Wallet" button',
        "Select MetaMask as your wallet",
        "Approve connection in MetaMask",
      ],
    },
    {
      number: 4,
      title: "Donate to a Campaign",
      description: "Support innovative projects with your AVAX tokens.",
      icon: DollarSign,
      steps: [
        "Browse available campaigns",
        "Select a project that resonates with you",
        "Enter donation amount in AVAX",
        "Confirm transaction in MetaMask",
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-extrabold text-base-content mb-4">
          How to <span className="text-primary">Donate</span>
        </h1>
        <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
          Your guide to supporting creative projects on CryptoFundit using AVAX,
          the Avalanche blockchain token.
        </p>
      </motion.div>

      {/* Donation Steps */}
      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-6 max-w-4xl mx-auto w-full">
          {donationSteps.map((step) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.number * 0.2 }}
            >
              <StepCard
                stepNumber={step.number}
                title={step.title}
                description={step.description}
                icon={step.icon}
                steps={step.steps}
                isActive={activeStep === step.number}
                onClick={() => setActiveStep(step.number)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-16"
      >
        <a href="/" className="btn btn-primary btn-lg">
          Explore Campaigns
        </a>
      </motion.div>
    </div>
  );
};

export default HowToDonate;
