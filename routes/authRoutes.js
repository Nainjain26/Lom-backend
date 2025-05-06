// routes/authRoutes.js
import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/admin-only", verifyToken, isAdmin, (req, res) => {
    res.json({ message: "Welcome, Admin!", user: req.user });
  });

export default router;
