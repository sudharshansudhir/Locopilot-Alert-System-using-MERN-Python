import React from "react";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user)
    return (
      <div className="text-center mt-20 text-red-600 text-xl">
        Please login to view your profile.
      </div>
    );

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-lg mx-auto bg-white p-6 mt-12 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-green-700 mb-4">Your Profile</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
