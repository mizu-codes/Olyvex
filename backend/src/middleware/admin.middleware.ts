import type { Request, Response, NextFunction } from "express"
import { User } from "../models/User.js"

export const adminMiddleware = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    const user = await User.findById(req.userId).select("role")

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      })
    }

    next()
  } catch (error) {
    console.error("Admin authorization error:", error)

    return res.status(500).json({
      message: "Internal server error",
    })
  }
}