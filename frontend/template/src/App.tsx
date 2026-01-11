import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import DocsPage from "./pages/DocsPage";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<DocsPage />} />

        {/* Dashboard Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="market" element={<div className="p-8 text-neutral-500">Market View (Coming Soon)</div>} />
          <Route path="portfolio" element={<div className="p-8 text-neutral-500">Portfolio View (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-8 text-neutral-500">Settings View (Coming Soon)</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
