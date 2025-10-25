// backend/routes/collisionRoutes.js
const express = require("express");
const router = express.Router();
const checkCollision = require("../services/collisionDetector");

router.get("/", async (req, res) => {
  try {
    const locopilotId = req.query.locopilotId;
    const collisions = await checkCollision();
    // Filter collisions relevant to given locopilotId if provided
    const relevant = locopilotId ? collisions.filter(
      c => c.t1.locopilotId === locopilotId || c.t2.locopilotId === locopilotId
    ) : collisions;
    res.json(relevant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check collisions" });
  }
});

module.exports = router;
