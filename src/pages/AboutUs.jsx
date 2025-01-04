import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Eye, 
  Shield, 
  Globe, 
  Target, 
  Users, 
  Lock,
  ArrowRight,
  ExternalLink
} from "lucide-react";

const AboutUs = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -5,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-16 max-w-7xl"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="text-center mb-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block p-4 rounded-full bg-primary/10 mb-6"
        >
          <Rocket size={40} className="text-primary" />
        </motion.div>
        
        <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          About CryptoFundit
        </h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-lg text-base-content/70 max-w-2xl mx-auto"
        >
          Revolutionizing crowdfunding with blockchain technology. Empowering
          creativity, transparency, and innovation through decentralized
          solutions.
        </motion.p>
      </motion.div>

      {/* Vision and Mission Section */}
      <motion.div variants={itemVariants} className="grid gap-8 md:grid-cols-2 mb-16">
        {/* Vision */}
        <motion.div
          whileHover="hover"
          variants={cardHoverVariants}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h2 className="card-title text-2xl">Our Vision</h2>
            </div>
            <p className="text-base-content/70 leading-relaxed">
              Our vision is to democratize crowdfunding by providing a
              transparent, borderless platform where creativity and innovation
              thrive. By leveraging blockchain technology, we ensure trust and
              accountability between project creators and their supporters.
            </p>
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          whileHover="hover"
          variants={cardHoverVariants}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Target className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="card-title text-2xl">Our Mission</h2>
            </div>
            <p className="text-base-content/70 leading-relaxed">
              We aim to simplify the fundraising process while protecting
              contributors' investments. With CryptoFundit, every project is
              backed by immutable smart contracts, creating a secure and
              verifiable environment for all parties involved.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Values Section */}
      <motion.div variants={itemVariants} className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Why Choose Us?
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: <Lock className="w-12 h-12" />,
              title: "Transparency",
              description: "Immutable records on the blockchain ensure complete transparency in all transactions.",
              color: "primary"
            },
            {
              icon: <Shield className="w-12 h-12" />,
              title: "Security",
              description: "Your funds are secured by smart contracts, minimizing the risk of fraud.",
              color: "secondary"
            },
            {
              icon: <Globe className="w-12 h-12" />,
              title: "Global Reach",
              description: "A borderless platform that allows anyone, anywhere to participate and innovate.",
              color: "accent"
            }
          ].map((value, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover="hover"
              custom={index}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body items-center text-center">
                <div className={`p-4 rounded-full bg-${value.color}/10 text-${value.color}`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mt-4 mb-2">{value.title}</h3>
                <p className="text-base-content/70">{value.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Section
      <motion.div variants={itemVariants} className="mb-16">
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Users className="w-8 h-8" />
            </div>
            <div className="stat-title">Active Users</div>
            <div className="stat-value text-primary">25.6K</div>
            <div className="stat-desc">21% more than last month</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-secondary">
              <Target className="w-8 h-8" />
            </div>
            <div className="stat-title">Successful Projects</div>
            <div className="stat-value text-secondary">1,200</div>
            <div className="stat-desc">90% success rate</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-accent">
              <Globe className="w-8 h-8" />
            </div>
            <div className="stat-title">Countries</div>
            <div className="stat-value text-accent">150+</div>
            <div className="stat-desc">Global presence</div>
          </div>
        </div>
      </motion.div> */}

      {/* Call to Action */}
      <motion.div 
        variants={itemVariants}
        className="card bg-base-100 shadow-xl"
      >
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl mb-4">Ready to Get Started?</h2>
          <p className="text-base-content/70 mb-6 max-w-2xl">
            Join thousands of innovators and creators on CryptoFundit. Start your journey
            with blockchain-powered crowdfunding today.
          </p>
          <div className="flex gap-4">
            <Link
              to="https://testnet.snowtrace.io/address/0xdBcc37E59CE496A830Aa9F6719BEA2FF86F435EB"
              className="btn btn-primary gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Snowtrace
              <ExternalLink className="w-4 h-4" />
            </Link>
            <Link to="/" className="btn btn-outline gap-2">
              Browse Campaigns
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AboutUs;