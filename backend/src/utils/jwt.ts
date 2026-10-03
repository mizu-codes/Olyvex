import "dotenv/config"
import { SignJWT } from "jose"
 
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error("JWT_SECRET is not defined")
  }

  return new TextEncoder().encode(secret)
}

export const generateAccessToken = async (
  userId: string,
  role: "user" | "admin"
) => {
  const secret = getJwtSecret()

  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret)
}