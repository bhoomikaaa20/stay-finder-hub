import express from "express";
import { login, signup, getMe } from "../controllers/authController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", verifyToken, getMe);

export default router;