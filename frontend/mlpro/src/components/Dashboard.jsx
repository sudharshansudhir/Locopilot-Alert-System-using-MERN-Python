import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { fetchTrains, addTrain, updateTrain, updateLocation } from "../api/api";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function Dashboard() {
  const savedId = localStorage.getItem("locopilotId") || uuidv4();
  const [locopilotId] = useState(savedId);
  useEffect(() => localStorage.setItem("locopilotId", savedId), [savedId]);

  const [socket, setSocket] = useState(null);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    trainNumber: "",
    startLocation: "",
    endLocation: "",
    date: "",
    departureTime: "",
    arrivalTime: "",
    currentTrack: "",
    currentDistance: 0,
    status: "On Schedule",
  });

  const [myTrain, setMyTrain] = useState(null);
  const locationRef = useRef({ lat: null, lng: null });

  // ✅ Socket Setup
  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);

    s.on("collisionAlert", (payload) => {
      Swal.fire({
        icon: "warning",
        title: "⚠️ Collision Risk Detected!",
        html: `<strong>${payload.train1}</strong> & <strong>${payload.train2}</strong><br/>on <b>Track ${payload.track}</b><br/>ETA Difference: ${payload.etaDiffMinutes} min`,
        confirmButtonText: "Acknowledge",
      });
    });

    s.on("connect", () => s.emit("joinLocopilot", locopilotId));

    s.on("trains:update", (data) => {
      setTrains(data);
      const my = data.find((t) => t.locopilotId === locopilotId);
      setMyTrain(my || null);
    });

    return () => s.disconnect();
  }, [locopilotId]);

  // ✅ Fetch Trains
  const loadTrains = async () => {
    setLoading(true);
    const data = await fetchTrains();
    setTrains(data);
    const my = data.find((t) => t.locopilotId === locopilotId);
    setMyTrain(my || null);
    setLoading(false);
  };

  useEffect(() => {
    loadTrains();
    const iv = setInterval(loadTrains, 10000);
    return () => clearInterval(iv);
  }, []);

  // ✅ Geo Update
  useEffect(() => {
    let watchId = null;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          locationRef.current.lat = pos.coords.latitude;
          locationRef.current.lng = pos.coords.longitude;
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
      );
    }

    const interval = setInterval(async () => {
      const lat = locationRef.current.lat;
      const lng = locationRef.current.lng;
      if (!lat || !lng) return;
      if (socket && myTrain) {
        const payload = {
          trainId: myTrain._id,
          locopilotId,
          currentLat: lat,
          currentLng: lng,
          currentDistance: form.currentDistance,
          currentTrack: form.currentTrack,
        };
        socket.emit("location:update", payload);
        await updateLocation(myTrain._id, {
          currentLat: lat,
          currentLng: lng,
          currentDistance: form.currentDistance,
        });
      }
    }, 5000);

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      clearInterval(interval);
    };
  }, [socket, myTrain, form.currentTrack, form.currentDistance, locopilotId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Add or Edit Train
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Allow only one train per user
    if (!editingId && myTrain) {
      Swal.fire("⚠️ Limit Reached", "You can add only one active train at a time.", "warning");
      return;
    }

    try {
      if (editingId) {
        await updateTrain(editingId, { ...form, locopilotId });
        Swal.fire("✅ Updated Successfully!");
      } else {
        const res = await addTrain({ ...form, locopilotId });
        Swal.fire("✅ Train Added!");
        if (res && res._id) setMyTrain(res);
      }

      setForm({
        trainNumber: "",
        startLocation: "",
        endLocation: "",
        date: "",
        departureTime: "",
        arrivalTime: "",
        currentTrack: "",
        currentDistance: 0,
        status: "On Schedule",
      });
      setEditingId(null);
      loadTrains();
    } catch (err) {
      console.error(err);
      Swal.fire("❌ Error", "Failed to save train data", "error");
    }
  };

  // ✅ Edit
  const handleEdit = (t) => {
    if (t.locopilotId !== locopilotId) return;
    setForm({
      trainNumber: t.trainNumber,
      startLocation: t.startLocation,
      endLocation: t.endLocation,
      date: t.date,
      departureTime: t.departureTime,
      arrivalTime: t.arrivalTime,
      currentTrack: t.currentTrack,
      currentDistance: t.currentDistance || 0,
      status: t.status || "On Schedule",
    });
    setEditingId(t._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Delete
  const handleDelete = async (id, trainOwner) => {
    if (trainOwner !== locopilotId) return Swal.fire("❌ Error", "You can delete only your train", "error");

    if (!confirm("Are you sure you want to delete this train?")) return;
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/train/delete/${id}?locopilotId=${locopilotId}`,
        { method: "DELETE" }
      );
      Swal.fire("🗑️ Deleted Successfully!");
      setMyTrain(null);
      loadTrains();
    } catch (err) {
      Swal.fire("❌ Error", "Failed to delete train", "error");
    }
  };

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-xl space-y-4 border-l-4 border-green-600"
      >
        <h2 className="text-2xl font-bold text-green-700 mb-2">
          🚆 Add / Edit Train Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="trainNumber"
            value={form.trainNumber}
            onChange={handleChange}
            placeholder="Enter train number (e.g. 101A)"
            required
            className="p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <input
            name="startLocation"
            value={form.startLocation}
            onChange={handleChange}
            placeholder="Enter start station"
            required
            className="p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <input
            name="endLocation"
            value={form.endLocation}
            onChange={handleChange}
            placeholder="Enter destination station"
            required
            className="p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <input
            type="time"
            name="departureTime"
            value={form.departureTime}
            onChange={handleChange}
            required
            placeholder="Departure"
            className="p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <input
            type="time"
            name="arrivalTime"
            value={form.arrivalTime}
            onChange={handleChange}
            required
            placeholder="Arrival"
            className="p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <input
            name="currentTrack"
            value={form.currentTrack}
            onChange={handleChange}
            placeholder="Enter track number (e.g. Track-1)"
            className="p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            name="currentDistance"
            value={form.currentDistance}
            onChange={handleChange}
            placeholder="Enter current distance (m)"
            className="p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500"
          >
            <option>On Schedule</option>
            <option>Delayed</option>
            <option>Cancelled</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-transform transform hover:scale-105"
        >
          {editingId ? "Update Train" : "Add Train"}
        </button>
      </form>

      {/* Table Section */}
      <h2 className="text-2xl font-bold text-green-700 mt-10 mb-4">
        🚉 Active Trains
      </h2>

      {loading ? (
        <p className="text-green-700 font-medium">Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full border-collapse border border-green-200">
            <thead className="bg-green-100 text-green-800">
              <tr>
                <th className="border px-4 py-2">Train</th>
                <th className="border px-4 py-2">Journey</th>
                <th className="border px-4 py-2">Date / Departure</th>
                <th className="border px-4 py-2">Arrival</th>
                <th className="border px-4 py-2">Track / Distance</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trains.map((t) => (
                <tr
                  key={t._id}
                  className={`hover:bg-green-50 transition ${
                    t.locopilotId === locopilotId
                      ? "bg-green-100 font-semibold"
                      : ""
                  }`}
                >
                  <td className="border px-4 py-2">{t.trainNumber}</td>
                  <td className="border px-4 py-2">
                    {t.startLocation} → {t.endLocation}
                  </td>
                  <td className="border px-4 py-2">
                    {t.date} / {t.departureTime}
                  </td>
                  <td className="border px-4 py-2">{t.arrivalTime}</td>
                  <td className="border px-4 py-2">
                    {t.currentTrack} / {Math.round(t.currentDistance || 0)} m
                  </td>
                  <td className="border px-4 py-2">{t.status}</td>
                  <td className="border px-4 py-2 text-center">
                    {t.locopilotId === locopilotId ? (
                      <>
                        <button
                          onClick={() => handleEdit(t)}
                          className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.locopilotId)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">No Access</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
