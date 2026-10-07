import { User } from "../../models/User.js";
import type { Request, Response } from "express";
import cloudinary from "../../config/cloudinary.js";

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
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

interface UpdateProfileRequestBody {
  name?: string;
  email?: string;
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { name, email } = req.body as UpdateProfileRequestBody;

    if (!name && !email) {
      return res.status(400).json({
        message: "Nothing to update",
      });
    }

    const user = await User.findById(req.userId);

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

      user.name = trimmedName;
    }

 if (email !== undefined) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({
      message: "Email cannot be empty",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({
      message: "Please enter a valid email address",
    });
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: req.userId },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Email already in use",
    });
  }

  user.email = normalizedEmail;
}

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Profile image is required",
      });
    }

    const file = req.file;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const uploadedImage = await new Promise<{ url: string; publicId: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "olyvex/profile-images",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result?.secure_url || !result.public_id) {
              reject(new Error("Cloudinary upload failed"));
              return;
            }

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          },
        );

        uploadStream.end(file.buffer);
      },
    );
    const oldPublicId = user.profileImagePublicId;

    user.profileImage = uploadedImage.url;
    user.profileImagePublicId = uploadedImage.publicId;

    await user.save();

    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
        });
      } catch (error) {
        console.error("Failed to delete old profile image:", error);
      }
    }

    return res.status(200).json({
      message: "Profile image uploaded successfully",
      profileImage: uploadedImage.url,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);

    return res.status(500).json({
      message: "Profile image upload failed",
    });
  }
};
