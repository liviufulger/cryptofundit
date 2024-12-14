import React from "react";
import Navigation from "./Navigation";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-100 via-white to-gray-100 text-gray-800">
      {/* Navigation */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <Navigation />
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-8">
       
          {children}
        
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-200 text-center text-sm">
      <p>© 2024 CryptoFundit. Built for the future of crowdfunding.</p>
        <div className="flex justify-center mt-4 space-x-6 text-gray-600">
          <a
            href="#"
            className="hover:text-gray-900 transition-colors"
          >
            X
          </a>
          <a
            href="#"
            className="hover:text-gray-900 transition-colors"
          >
            GitHub
          </a>
          <a
            href="#"
            className="hover:text-gray-900 transition-colors"
          >
            Discord
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
