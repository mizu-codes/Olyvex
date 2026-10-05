import { Router } from "express";
import { register, login, refresh,logout } from "../controllers/auth/auth.controller.js";
import { getMe, updateProfile } from "../controllers/profile/profile.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { uploadProfileImage } from "../controllers/profile/profile.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);
router.put(
  "/profile/image",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage,
);

export default router;
