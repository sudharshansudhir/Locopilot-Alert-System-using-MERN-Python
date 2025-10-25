// frontend/src/api/trainAPI.js
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/trains";

export const getMyTrains = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${BASE_URL}/my-trains`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addTrain = async (data) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${BASE_URL}/add`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateTrain = async (id, data) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${BASE_URL}/update/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteTrain = async (id) => {
  const token = localStorage.getItem("token");
  const res = await axios.delete(`${BASE_URL}/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
