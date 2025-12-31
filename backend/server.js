// backend/server.js
import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import trainRoutes from "./routes/trainRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { checkCollision } from "./services/collisionDetector.js";
import Train from "./models/Train.js";
import dotenv from "dotenv"
dotenv.config()


const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "http://localhost:5173", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

app.set("io", io);

app.use("/api/train", trainRoutes);
app.use("/api/auth", authRoutes);

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("joinLocopilot", (locopilotId) => {
    if (!locopilotId) return;
    socket.join(locopilotId);
    console.log(`👨‍✈️ Locopilot ${locopilotId} joined room`);
  });

  // 🔹 Listen to location updates from frontend
  socket.on("location:update", async (data) => {
    try {
      const { trainId, currentLat, currentLng, currentDistance, currentTrack } = data;
      const train = await Train.findById(trainId);
      if (!train) return;

      train.currentLat = currentLat;
      train.currentLng = currentLng;
      train.currentDistance = currentDistance;
      train.currentTrack = currentTrack;
      await train.save();

      // broadcast updated trains to all clients
      const allTrains = await Train.find();
      io.emit("trains:update", allTrains);
    } catch (err) {
      console.error("❌ Error updating train location:", err);
    }
  });

  socket.on("disconnect", () => console.log("🔴 Socket disconnected:", socket.id));
});

// 🔹 Collision check every 5 seconds
setInterval(async () => {
  try {
    const collisions = await checkCollision();
    if (collisions.length > 0) {
      collisions.forEach((c) => {
        if (c.locopilot1 && c.locopilot2) {
          io.to(c.locopilot1)
            .to(c.locopilot2)
            .emit("collisionAlert", {
              train1: c.train1,
              train2: c.train2,
              track: c.track,
              distanceMeters: c.distanceDiff_m,
              etaDiffMinutes: c.etaDiff_min,
            });
          console.log(`⚠️ Collision alert sent to ${c.locopilot1} & ${c.locopilot2}`);
        }
      });
    }
  } catch (err) {
    console.error("❌ Collision check error:", err);
  }
}, 5000);

const PORT = 5000;
server.listen(PORT, () => console.log(`🚆 Server running on port ${PORT}`));
