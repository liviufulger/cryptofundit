import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "./context/Web3Context";

import Home from "./pages/Home";
import MyCampaigns from "./pages/MyCampaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import ManageCampaign from "./pages/ManageCampaign";
import AdminDashboard from "./pages/AdminDashboard";
import Layout from "./components/Layout";
import AboutUs from "./pages/AboutUs";
import HowToDonate from "./pages/HowToDonate";

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/my-campaigns" element={<MyCampaigns />} />
              <Route path="/create-campaign" element={<CreateCampaign />} />
              <Route path="/campaign/:id" element={<CampaignDetails />} />
              <Route
                path="/campaigns/:id/manage"
                element={<ManageCampaign />}
              />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/how-to-donate" element={<HowToDonate />} />
            </Routes>
          </Layout>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
