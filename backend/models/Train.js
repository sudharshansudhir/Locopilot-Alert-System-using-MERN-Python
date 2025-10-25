// backend/models/Train.js
import mongoose from "mongoose";

const trainSchema = new mongoose.Schema({
  trainNumber: String,
  startLocation: String,
  endLocation: String,
  date: String,
  departureTime: String,
  arrivalTime: String,
  currentTrack: String,
  currentDistance: { type: Number, default: 0 }, // distance on that track
  status: { type: String, default: "On Schedule" },
  locopilotId: String, // pilot unique id
  currentLat: Number,
  currentLng: Number,
});

const Train = mongoose.model("Train", trainSchema);
export default Train;
