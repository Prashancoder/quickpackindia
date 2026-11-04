import { Router } from "express";
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  changePassword,
  updateBusinessProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/signup", signup);
router.post("/register", signup); // alias for registration
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/me", requireAuth, getMe);
router.put("/profile", requireAuth, updateProfile);
router.put("/business", requireAuth, updateBusinessProfile);
router.post("/addresses", requireAuth, addAddress);
router.put("/addresses/:addressId", requireAuth, updateAddress);
router.delete("/addresses/:addressId", requireAuth, deleteAddress);
router.put("/change-password", requireAuth, changePassword);

export default router;
