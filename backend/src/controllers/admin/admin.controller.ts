import type { Request, Response } from "express";
import { User } from "../../models/User.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import cloudinary from "../../config/cloudinary.js";
import { isValidObjectId } from "mongoose";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { loginSchema } from "../../schemas/auth.schema.js";
import {
  createAdminUserSchema,
  updateAdminUserSchema,
} from "../../schemas/adminUser.schema.js";

export const adminRefresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.adminRefreshToken;

    if (!token) {
      return res.status(401).json({
        message: "Admin session not found",
      });
    }

    const payload = await verifyRefreshToken(token);

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: "Admin session invalid",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const accessToken = await generateAccessToken(
      user._id.toString(),
      user.role,
    );

    return res.status(200).json({
      token: accessToken,
    });
  } catch (error) {
    console.error("Admin refresh error:", error);

    return res.status(401).json({
      message: "Invalid or expired admin session",
    });
  }
};

export const getAdminMe = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Get admin user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const adminLogout = async (_req: Request, res: Response) => {
  res.clearCookie("adminRefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/admin",
  });

  return res.status(200).json({
    message: "Admin logged out successfully",
  });
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: validation.error.issues[0]?.message ?? "Invalid login data",
      });
    }

    const { email: normalizedEmail, password } = validation.data;

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const accessToken = await generateAccessToken(
      user._id.toString(),
      user.role,
    );

    const refreshToken = await generateRefreshToken(user._id.toString());

    res.cookie("adminRefreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/admin",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Admin login successful",
      token: accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const escapeRegex = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const ALLOWED_PAGE_SIZES = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

const parsePositiveInt = (value: unknown, fallback: number) => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const requestedLimit = parsePositiveInt(req.query.limit, DEFAULT_PAGE_SIZE);
    const limit = (ALLOWED_PAGE_SIZES as readonly number[]).includes(
      requestedLimit,
    )
      ? requestedLimit
      : DEFAULT_PAGE_SIZE;
    const requestedPage = parsePositiveInt(req.query.page, 1);

    const filter = search
      ? {
          $and: [
            { _id: { $ne: req.userId } },
            {
              $or: [
                {
                  name: {
                    $regex: escapeRegex(search),
                    $options: "i",
                  },
                },
                {
                  email: {
                    $regex: escapeRegex(search),
                    $options: "i",
                  },
                },
              ],
            },
          ],
        }
      : {
          _id: { $ne: req.userId },
        };

    const total = await User.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, totalPages);

    const users = await User.find(filter)
      .select("-password -profileImagePublicId")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const validation = createAdminUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: validation.error.issues[0]?.message ?? "Invalid user data",
      });
    }

    const {
      name: trimmedName,
      email: normalizedEmail,
      password,
      role = "user",
    } = validation.data;

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const validation = updateAdminUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: validation.error.issues[0]?.message ?? "Invalid user data",
      });
    }

    const { name, email, role } = validation.data;

    if (id.toLowerCase() === req.userId?.toLowerCase() && role === "user") {
      return res.status(403).json({
        message: "You cannot change your own admin role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already in use",
        });
      }

      user.email = email;
    }

    if (role !== undefined) {
      user.role = role;
    }

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (id.toLowerCase() === req.userId?.toLowerCase()) {
      return res.status(403).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId, {
          resource_type: "image",
        });
      } catch (error) {
        console.error("Failed to delete user's Cloudinary image:", error);
      }
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
