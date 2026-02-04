import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "nprogress/nprogress.css";

import DonorsPage from "./pages/DonorsPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import Segement from "./pages/Segement.jsx";
import Catagory from "./pages/Catagory.jsx";

export default function App() {
  return (
    <BrowserRouter>
      {/*  Popups */}
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <Routes>
        <Route path="/donors" element={<DonorsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/segments" element={<Segement />} />
        <Route path="/categories" element={<Catagory />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/donors" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
