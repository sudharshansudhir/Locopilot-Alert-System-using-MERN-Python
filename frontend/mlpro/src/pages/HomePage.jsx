import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [visible, setVisible] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  // Redirect to login if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-green-50 overflow-hidden">
      <Navbar />
      <video
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      >
        <source src="/trainv.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-green-900/40"></div>

      <div
        ref={contentRef}
        className={`relative z-10 flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center text-white px-4 transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
          Welcome to <span className="text-green-300">LocoPilot</span> Live
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-6">
          Your AI-powered train safety and collision prevention dashboard.
        </p>
        <a
          href="/dashboard"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-105"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
