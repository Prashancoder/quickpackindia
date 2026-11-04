import crypto from "crypto";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { AuthRequest } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "quickpack_jwt_secret_key_production_grade_super_secure_2026";
const COOKIE_EXPIRES_DAYS = 7;

function generateToken(user: IUser): string {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: `${COOKIE_EXPIRES_DAYS}d` }
  );
}

function setAuthCookie(res: Response, token: string): void {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });
}

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Name, email, and password are required." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({ success: false, message: "An account with this email already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // First registered user can be ADMIN, subsequent users are USER
    const count = await User.countDocuments();
    const role = count === 0 ? "ADMIN" : "USER";

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      passwordHash,
      role,
      addresses: [],
      wishlist: [],
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create account." });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: "Logged in successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Login failed." });
  }
}

export function logout(req: Request, res: Response): void {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ success: true, message: "Logged out successfully." });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      businessProfile: req.user.businessProfile,
      addresses: req.user.addresses,
      wishlist: req.user.wishlist,
    },
  });
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { name, phone } = req.body;
    if (name) req.user.name = name.trim();
    if (phone !== undefined) req.user.phone = phone.trim();

    await req.user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        addresses: req.user.addresses,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update profile." });
  }
}

export async function addAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { fullName, phone, houseFlat, street, area, city, state, pincode, landmark, isDefault } =
      req.body;

    if (!fullName || !phone || !houseFlat || !street || !area || !city || !state || !pincode) {
      res.status(400).json({ success: false, message: "Please fill all required address fields." });
      return;
    }

    if (isDefault) {
      req.user.addresses.forEach((addr) => (addr.isDefault = false));
    } else if (req.user.addresses.length === 0) {
      // First address defaults to true
      req.body.isDefault = true;
    }

    req.user.addresses.push({
      fullName,
      phone,
      houseFlat,
      street,
      area,
      city,
      state,
      pincode,
      landmark,
      isDefault: isDefault ?? (req.user.addresses.length === 0),
    });

    await req.user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully.",
      addresses: req.user.addresses,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to add address." });
  }
}

export async function updateAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { addressId } = req.params;
    const address = req.user.addresses.id(addressId);

    if (!address) {
      res.status(404).json({ success: false, message: "Address not found." });
      return;
    }

    const { fullName, phone, houseFlat, street, area, city, state, pincode, landmark, isDefault } =
      req.body;

    if (isDefault) {
      req.user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (houseFlat) address.houseFlat = houseFlat;
    if (street) address.street = street;
    if (area) address.area = area;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (landmark !== undefined) address.landmark = landmark;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await req.user.save();

    res.json({
      success: true,
      message: "Address updated successfully.",
      addresses: req.user.addresses,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update address." });
  }
}

export async function deleteAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { addressId } = req.params;
    req.user.addresses = req.user.addresses.filter((a) => a._id?.toString() !== addressId) as any;

    if (req.user.addresses.length > 0 && !req.user.addresses.some((a) => a.isDefault)) {
      req.user.addresses[0].isDefault = true;
    }

    await req.user.save();

    res.json({
      success: true,
      message: "Address deleted successfully.",
      addresses: req.user.addresses,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete address." });
  }
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Current and new password are required." });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Incorrect current password." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password changed successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to change password." });
  }
}

export async function updateBusinessProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { companyName, gstin, pan, contactPerson } = req.body;
    if (!req.user.businessProfile) {
      req.user.businessProfile = {};
    }

    if (companyName !== undefined) req.user.businessProfile.companyName = companyName.trim();
    if (gstin !== undefined) req.user.businessProfile.gstin = gstin.trim().toUpperCase();
    if (pan !== undefined) req.user.businessProfile.pan = pan.trim().toUpperCase();
    if (contactPerson !== undefined) req.user.businessProfile.contactPerson = contactPerson.trim();

    // If companyName or gstin is set, also upgrade role to BUSINESS if currently USER
    if ((companyName || gstin) && req.user.role === "USER") {
      req.user.role = "BUSINESS";
    }

    await req.user.save();

    res.json({
      success: true,
      message: "Business profile updated successfully.",
      businessProfile: req.user.businessProfile,
      role: req.user.role,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update business profile." });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Please provide an email address." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return ambiguous message for security
      res.json({
        success: true,
        message: "If an account with that email exists, password reset instructions have been generated.",
      });
      return;
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const siteUrl = process.env.CLIENT_URL || process.env.VITE_SITE_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/reset-password/${resetToken}`;

    // If SMTP is configured, we could send an email. For now return safe response with token in dev:
    console.log(`[Auth] Password reset link for ${user.email}: ${resetUrl}`);

    res.json({
      success: true,
      message: "If an account with that email exists, password reset instructions have been generated.",
      // Include token/url for development & testing
      resetToken: process.env.NODE_ENV !== "production" ? resetToken : undefined,
      resetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to initiate password reset." });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const token = req.params.token || req.body.token;
    const { password } = req.body;

    if (!token || !password) {
      res.status(400).json({ success: false, message: "Token and new password are required." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
      return;
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ success: false, message: "Invalid or expired password reset token." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const authToken = generateToken(user);
    setAuthCookie(res, authToken);

    res.json({
      success: true,
      message: "Password reset successfully. You are now logged in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token: authToken,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to reset password." });
  }
}

