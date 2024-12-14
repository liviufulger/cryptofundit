import React from "react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          About <span className="text-primary">CryptoFundit</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Revolutionizing crowdfunding with blockchain technology. Empowering
          creativity, transparency, and innovation through decentralized
          solutions.
        </p>
      </div>

      {/* Vision and Mission Section */}
      <div className="grid gap-12 md:grid-cols-2">
        {/* Vision */}
        <div className="card shadow-lg bg-white border border-gray-200">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              Our Vision
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our vision is to democratize crowdfunding by providing a
              transparent, borderless platform where creativity and innovation
              thrive. By leveraging blockchain technology, we ensure trust and
              accountability between project creators and their supporters.
            </p>
          </div>
        </div>
        {/* Mission */}
        <div className="card shadow-lg bg-white border border-gray-200">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We aim to simplify the fundraising process while protecting
              contributors' investments. With CryptoFundit, every project is
              backed by immutable smart contracts, creating a secure and
              verifiable environment for all parties involved.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-8">
          Why Choose Us?
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="card shadow-md bg-white p-6 border border-gray-200">
            <div className="card-body text-center">
              <h3 className="text-xl font-bold text-primary mb-2">
                Transparency
              </h3>
              <p className="text-gray-600">
                Immutable records on the blockchain ensure complete transparency
                in all transactions.
              </p>
            </div>
          </div>
          <div className="card shadow-md bg-white p-6 border border-gray-200">
            <div className="card-body text-center">
              <h3 className="text-xl font-bold text-primary mb-2">Security</h3>
              <p className="text-gray-600">
                Your funds are secured by smart contracts, minimizing the risk
                of fraud.
              </p>
            </div>
          </div>
          <div className="card shadow-md bg-white p-6 border border-gray-200">
            <div className="card-body text-center">
              <h3 className="text-xl font-bold text-primary mb-2">
                Global Reach
              </h3>
              <p className="text-gray-600">
                A borderless platform that allows anyone, anywhere to
                participate and innovate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16">
        <Link
          to="https://testnet.snowtrace.io/address/0xa8C4d67Bb779d99d97A91c86FA0327A0b1781783"
          className="btn btn-primary btn-lg px-8 py-3 shadow-lg"
        >
          Snowtrace
        </Link>
      </div>
    </div>
  );
};

export default AboutUs;
