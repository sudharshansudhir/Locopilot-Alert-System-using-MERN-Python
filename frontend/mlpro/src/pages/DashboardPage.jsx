// frontend/src/pages/DashboardPage.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Dashboard from "../components/Dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <Dashboard />
      </div>
    </div>
  );
}
