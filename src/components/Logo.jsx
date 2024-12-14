import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = "" }) => {
  return (
    <Link 
      to="/" 
      className={`flex items-center space-x-2 group ${className}`}
    >
      <div className="bg-gradient-to-br from-primary to-secondary rounded-full p-2 shadow-md transition-transform group-hover:scale-105">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          className="w-6 h-6 text-white"
          fill="currentColor"
        >
          <path d="M11.25 4.533l-7.25 6.616v8.101l7.25-6.617zm1.5 0v8.535l7.25 6.617v-8.101zm-9-1.066c0-.914.713-1.467 1.569-1.467h16.862c.856 0 1.569.553 1.569 1.467v10.203l-9.75 7.058-9.75-7.057v-10.204z"/>
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline">
          <span className="font-bold text-xl text-primary">Crypto</span>
          <span className="font-extrabold text-2xl text-secondary ml-1">Fundit</span>
        </div>
        <span className="text-xs text-gray-500 tracking-wider uppercase">
          Decentralized Funding
        </span>
      </div>
    </Link>
  );
};

export default Logo;