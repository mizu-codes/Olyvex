import { Schema, model } from "mongoose";

interface IUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  profileImage?: string;
  profileImagePublicId?: string
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImage: {
      type: String,
      default: null,
    },
    profileImagePublicId: {
  type: String,
  default: null,
},
  },
  {
    timestamps: true,
  },
);

export const User = model<IUser>("User", userSchema);
