// backend/middleware/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = "locopilot_secret_key"; // same as your auth/login file

export const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id; // attach user ID from token
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
