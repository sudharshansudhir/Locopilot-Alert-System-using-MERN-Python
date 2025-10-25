// frontend/src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-md hover:bg-green-100 transition-colors ${
      isActive ? "border-b-2 border-green-600 font-semibold text-green-800" : "text-green-700"
    }`;

  return (
    <nav className="bg-green-50 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <div className="text-2xl font-bold text-green-700">LocoPilot-DashBoard</div>
        <div className="flex space-x-4">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/profile" className={linkClass}>Profile</NavLink>
        </div>
      </div>
    </nav>
  );
}
