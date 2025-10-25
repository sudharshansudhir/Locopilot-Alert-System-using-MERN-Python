// backend/services/trainPositionUpdater.js
// const Train = require("../models/Train");
import Train from "../models/Train.js"

// Dummy simulator: update random positions for testing
async function updateTrainPositions() {
  try {
    const trains = await Train.find();
    for (const t of trains) {
      // simulate small movement if lat/lng present else set near base
      const baseLat = t.currentLat || 11.0168;
      const baseLng = t.currentLng || 76.9558;
      t.currentLat = baseLat + (Math.random() - 0.5) * 0.002;
      t.currentLng = baseLng + (Math.random() - 0.5) * 0.002;
      t.currentDistance = Math.max(0, (t.currentDistance || 0) + (Math.random() - 0.5) * 20);
      await t.save();
    }
    console.log("Updated positions for simulation");
  } catch (err) {
    console.error("Error updating train positions:", err);
  }
}

module.exports = updateTrainPositions;
