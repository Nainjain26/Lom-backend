import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js"; // ✅ Correct path
const router = express.Router();

router.get("/", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard", user: req.user });
});

export default router;
