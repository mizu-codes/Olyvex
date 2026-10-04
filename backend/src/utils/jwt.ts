import "dotenv/config"
import { SignJWT,jwtVerify } from "jose"

export const getAccessTokenSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined")
  }

  return new TextEncoder().encode(secret)
}

export const getRefreshTokenSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined")
  }

  return new TextEncoder().encode(secret)
}

export const generateAccessToken = async (
  userId: string,
  role: "user" | "admin"
) => {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getAccessTokenSecret())
}

export const generateRefreshToken = async (
  userId: string
) => {
  return new SignJWT({ tokenType: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getRefreshTokenSecret())
}

export const verifyRefreshToken = async (token: string) => {
  const { payload } = await jwtVerify(
    token,
    getRefreshTokenSecret()
  )

  if (
    payload.tokenType !== "refresh" ||
    typeof payload.sub !== "string"
  ) {
    throw new Error("Invalid refresh token")
  }

  return payload
}