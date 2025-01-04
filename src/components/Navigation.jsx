import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Wallet, Home, PlusCircle, List, Menu, X, LogOut, AlertTriangle, Currency } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import Logo from "./Logo";
import WalletConnectionModal from "./WalletConnectionModal";

// NavItem Component for consistent navigation links
const NavItem = ({ to, icon: Icon, children, className = "", onClick }) => (
  <Link 
    to={to} 
    className={`btn btn-ghost flex items-center gap-2 ${className}`}
    onClick={onClick}
  >
    <Icon className="h-5 w-5" />
    <span>{children}</span>
  </Link>
);

// WalletInfo Component to display connected wallet details
const WalletInfo = ({ 
  account, 
  balance, 
  disconnectWallet, 
  isMobile = false 
}) => {
  const formatAddress = useCallback((addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  }, []);

  return (
    <div className={`flex flex-col items-start ${isMobile ? 'p-2' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {formatAddress(account)}
        </span>
      </div>
      <span className="text-xs text-gray-500 mb-2">
        {balance} AVAX
      </span>
      <button
        onClick={disconnectWallet}
        className="btn btn-error btn-sm flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Disconnect
      </button>
    </div>
  );
};


// Main Navigation Component
const Navigation = () => {
  const { 
    account, 
    balance, 
    connectWallet, 
    connectWalletMetamask,
    disconnectWallet, 
    walletError,
    installWalletInstructions 
  } = useWeb3();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(prevState => !prevState);
  const toggleWalletModal = () => setIsWalletModalOpen(prevState => !prevState);

  const handleConnectWallet = () => {
    connectWallet();
    // If wallet error occurs, modal will remain open due to walletError state
  };

  const navigationItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/create-campaign", icon: PlusCircle, label: "Create Campaign" },
    { to: "/my-campaigns", icon: List, label: "My Campaigns" },
    { to: "/about-us", icon: Currency, label: "About Us" },
    
  ];

  return (
    <>
      <nav className="navbar bg-base-100 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-2 px-4">
          {/* Brand Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-6">
            {navigationItems.map((item) => (
              <NavItem 
                key={item.to} 
                to={item.to} 
                icon={item.icon}
              >
                {item.label}
              </NavItem>
            ))}
          </div>

          {/* Wallet and Mobile Menu Control */}
          <div className="flex items-center gap-4">
            {account ? (
              <>
                {/* Desktop Wallet Info */}
                <div className="hidden lg:block">
                  <WalletInfo 
                    account={account}
                    balance={balance}
                    disconnectWallet={disconnectWallet}
                  />
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  className="btn btn-ghost btn-circle lg:hidden"
                  onClick={toggleMenu}
                  aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </>
            ) : (
              <>
                {/* Connect Wallet for Desktop */}
                <button
                  onClick={toggleWalletModal}
                  className="btn btn-secondary btn-sm hidden lg:flex gap-2"
                >
                  <Wallet className="h-5 w-5" />
                  <span>Connect Wallet</span>
                </button>

                {/* Mobile Menu Toggle for Unconnected Wallet */}
                <button
                  className="btn btn-ghost btn-circle lg:hidden"
                  onClick={toggleMenu}
                  aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleMenu}>
            <div 
              className="absolute top-0 right-0 w-64 h-full bg-base-200 shadow-lg p-4 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                className="btn btn-ghost btn-circle absolute top-2 right-2"
                onClick={toggleMenu}
                aria-label="Close Menu"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Mobile Wallet Info */}
              {account && (
                <div className="mt-12 mb-4">
                  <WalletInfo 
                    account={account}
                    balance={balance}
                    disconnectWallet={disconnectWallet}
                    isMobile={true}
                  />
                </div>
              )}

              {/* Mobile Navigation Items */}
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <NavItem 
                    key={item.to} 
                    to={item.to} 
                    icon={item.icon}
                    className="justify-start w-full"
                    onClick={toggleMenu}
                  >
                    {item.label}
                  </NavItem>
                ))}

                {/* Connect Wallet for Mobile if not connected */}
                {!account && (
                  <button
                    onClick={toggleWalletModal}
                    className="btn btn-secondary w-full gap-2"
                  >
                    <Wallet className="h-5 w-5" />
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal
        isOpen={isWalletModalOpen}
        onClose={toggleWalletModal}
        connectWallet={handleConnectWallet}
        connectWalletMetamask={connectWalletMetamask}
        installWalletInstructions={installWalletInstructions}
        walletError={walletError}
      />
    </>
  );
};

export default Navigation;