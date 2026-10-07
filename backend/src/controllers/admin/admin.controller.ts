import type { Request, Response } from "express";
import { User } from "../../models/User.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import cloudinary from "../../config/cloudinary.js";
import { isValidObjectId } from "mongoose";
import { verifyRefreshToken } from "../../utils/jwt.js";

interface AdminLoginRequestBody {
  email: string;
  password: string;
}

interface CreateUserRequestBody {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
}

interface UpdateUserRequestBody {
  name?: string;
  email?: string;
  role?: "user" | "admin";
}

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
    const { email, password } = req.body as AdminLoginRequestBody;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getUsers = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

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

    const users = await User.find(filter)
      .select("-password -profileImagePublicId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      })),
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
    const {
      name,
      email,
      password,
      role = "user",
    } = req.body as CreateUserRequestBody;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return res.status(400).json({
        message: "Name cannot be empty",
      });
    }

    if (trimmedName.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters",
      });
    }

    if (trimmedName.length > 50) {
      return res.status(400).json({
        message: "Name must be 50 characters or less",
      });
    }

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "Email cannot be empty",
      });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    if (role !== "user" && role !== "admin") {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

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
    const { id } = req.params;
    const { name, email, role } = req.body as UpdateUserRequestBody;

    if (!id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (name === undefined && email === undefined && role === undefined) {
      return res.status(400).json({
        message: "Nothing to update",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      if (trimmedName.length < 2) {
        return res.status(400).json({
          message: "Name must be at least 2 characters",
        });
      }

      if (trimmedName.length > 50) {
        return res.status(400).json({
          message: "Name must be 50 characters or less",
        });
      }

      user.name = trimmedName;
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          message: "Email cannot be empty",
        });
      }

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already in use",
        });
      }

      user.email = normalizedEmail;
    }

    if (role !== undefined) {
      if (role !== "user" && role !== "admin") {
        return res.status(400).json({
          message: "Invalid role",
        });
      }

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
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (id === req.userId) {
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
