import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, X, AlertTriangle, Chrome, Lock } from 'lucide-react';

const WalletConnectionModal = ({ 
  isOpen, 
  onClose, 
  connectWallet, 
  connectWalletMetamask,
  installWalletInstructions,
  walletError 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Connect Wallet</h2>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-circle"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* No Wallet Error */}
        {walletError && walletError.type === 'no_wallet' && (
          <div className="alert alert-warning mb-4 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2 text-yellow-500" />
            <div>
              <p className="text-sm">{walletError.message}</p>
              <button 
                onClick={installWalletInstructions}
                className="btn btn-outline btn-secondary btn-sm mt-2"
              >
                Install MetaMask
              </button>
            </div>
          </div>
        )}

        {/* User Rejected Connection Error */}
        {walletError && walletError.type === 'user_rejected' && (
          <div className="alert alert-error mb-4 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2 text-red-500" />
            <div>
              <p className="text-sm">{walletError.message}</p>
            </div>
          </div>
        )}

        {/* Connection Buttons */}
        <div className="space-y-3">
          <button
            onClick={connectWallet}
            className="btn btn-outline w-full gap-2 mb-2"
          >
            <Chrome className="h-5 w-5" />
            <span>Connect Browser Wallet</span>
          </button>

          <button
            onClick={connectWalletMetamask}
            className="btn btn-primary w-full gap-2"
          >
            <Wallet className="h-5 w-5" />
            <span>Connect MetaMask SDK</span>
          </button>
        </div>

        {/* Learn More Link */}
        <div className="text-center mt-4">
          <Link 
            to="/how-to-donate" 
            className="text-sm text-blue-600 hover:underline"
            onClick={onClose}
          >
            New to Crypto Donations? Learn How to Donate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionModal;