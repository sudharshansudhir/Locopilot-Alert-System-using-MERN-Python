// backend/services/collisionDetector.js
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import Train from "../models/Train.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function checkCollision() {
  try {
    const trains = await Train.find();
    if (trains.length < 2) return [];

    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, "../python/collisionPredictor.py");

      const python = spawn("python", [pythonScript, JSON.stringify(trains)]);

      let result = "";
      let error = "";

      python.stdout.on("data", (data) => result += data.toString());
      python.stderr.on("data", (data) => error += data.toString());

      python.on("close", (code) => {
  if (code !== 0) {
    console.error("Python exited with code", code, error);
    reject(error);
  } else {
    try {
      console.log("Python output:", result); // 🔹 Add this
      const parsed = JSON.parse(result.trim());
      const collisionsWithIds = parsed.map(c => {
        const t1 = trains.find(t => t.trainNumber === c.train1);
        const t2 = trains.find(t => t.trainNumber === c.train2);
        console.log("Mapping trains:", t1?.trainNumber, t2?.trainNumber); // 🔹 Debug
        return {
          ...c,
          locopilot1: t1?.locopilotId,
          locopilot2: t2?.locopilotId
        };
      });
      resolve(collisionsWithIds);
    } catch (err) {
      console.error("Error parsing Python output:", result, err);
      resolve([]);
    }
  }
});

    });
  } catch (err) {
    console.error("Error in checkCollision:", err.message);
    return [];
  }
}
