import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";
import { comparePassword } from "../utils/password.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterRequestBody;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({
      message: "Email already registered",
    });
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  return res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

interface LoginRequestBody {
  email: string;
  password: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequestBody;

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
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const accessToken = await generateAccessToken(
      user._id.toString(),
      user.role,
    );

    const refreshToken = await generateRefreshToken(user._id.toString());

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      token: accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
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

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const refresh = async ( req: Request, res: Response ) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      })
    }

    const payload = await verifyRefreshToken(refreshToken)

    const user = await User.findById(payload.sub)

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      })
    }

    const accessToken = await generateAccessToken(
      user._id.toString(),
      user.role
    )

    return res.status(200).json({
      token: accessToken,
    })
  } catch (error) {
    console.error("Refresh error:", error)

    return res.status(401).json({
      message: "Invalid or expired refresh token",
    })
  }
}

export const logout = async (_req: Request, res: Response ) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  })

  return res.status(200).json({
    message: "Logout successful",
  })
}