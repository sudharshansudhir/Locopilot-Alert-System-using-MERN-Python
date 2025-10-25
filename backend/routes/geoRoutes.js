// backend/routes/geoRoutes.js
import express from "express"
const router = express.Router();

// Dummy geocode endpoint
router.get("/geocode", (req, res) => {
  const place = req.query.place || "";
  // returns Coimbatore for demo; replace with real geocode later
  res.json({ coordinates: [11.0168, 76.9558] });
});

// Dummy matrix endpoint
router.post("/matrix", (req, res) => {
  res.json({ distances: [[0, 12000]], durations: [[0, 900]] });
});

module.exports = router;
