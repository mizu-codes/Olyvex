import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { getAccessTokenSecret } from "../utils/jwt.js";

export const authMiddleware = async ( req: Request, res: Response, next: NextFunction ) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid authorization header",
    });
  }

  try {
    const { payload } = await jwtVerify(token, getAccessTokenSecret());

    if (typeof payload.sub !== "string") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.userId = payload.sub;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
