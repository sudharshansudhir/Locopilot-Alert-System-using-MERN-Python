import express from "express";
import Train from "../models/Train.js";

const router = express.Router();

// ✅ Fetch all trains
router.get("/all", async (req, res) => {
  try {
    const trains = await Train.find();
    res.json(trains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add new train
router.post("/add", async (req, res) => {
  try {
    const newTrain = new Train(req.body);
    await newTrain.save();
    res.json(newTrain);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update train
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Train.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete train
router.delete("/delete/:id", async (req, res) => {
  try {
    await Train.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
