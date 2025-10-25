// frontend/src/api/api.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const fetchTrains = async () => {
  const res = await fetch(`${API_URL}/api/train/all`);
  if (!res.ok) throw new Error("Failed to fetch trains");
  return await res.json();
};

export const addTrain = async (data) => {
  const res = await fetch(`${API_URL}/api/train/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const updateTrain = async (id, data) => {
  const res = await fetch(`${API_URL}/api/train/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const updateLocation = async (id, data) => {
  const res = await fetch(`${API_URL}/api/train/update-location/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};
