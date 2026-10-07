import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import {
  adminLogin,
  adminRefresh,
  getAdminMe,
  adminLogout,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/admin/admin.controller.js";

const router = Router();

router.post("/refresh", adminRefresh);
router.get("/me", authMiddleware, adminMiddleware, getAdminMe);
router.post("/logout", adminLogout);
router.post("/login", adminLogin);

router.get("/users", authMiddleware, adminMiddleware, getUsers);
router.post("/users", authMiddleware, adminMiddleware, createUser);
router.put("/users/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;
