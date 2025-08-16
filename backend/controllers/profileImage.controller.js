import User from "../models/user.model.js";
import { s3 } from "../utils/s3Client.js";
import uploadFileToS3 from "../utils/s3Client.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("user id", userId);
    const user = await User.findById(userId);

    const { name, bio } = req.body;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageName = `${Date.now()}_${file.originalname}`;
    const profileImageKey = `uploads/${imageName}`;

    const profileImageUrl = await uploadFileToS3(file, profileImageKey);

    console.log("Profile image URL:", profileImageUrl);

    try {
      user.profileImageUrl = profileImageUrl;
      user.profileImageKey = profileImageKey;
      user.name = name;
      user.bio = bio;
      await user.save();
      return res
        .status(200)
        .json({ message: "Profile image uploaded successfully" });
    } catch (error) {
      console.error("Error saving profile image:", error);
      return res.status(500).json({ message: "Failed to save profile image" });
    }
  } catch (error) {
    console.error("Error in uploadProfileImage controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profileImageKey) {
      const profileImageKey = user.profileImageKey;
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: profileImageKey,
      };

      try {
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
      } catch (error) {
        console.error("Error deleting profile image:", error);
        return res
          .status(500)
          .json({ message: "Failed to delete profile image" });
      }

      user.profileImageUrl = null;
      user.profileImageKey = null;
      await user.save();
      return res
        .status(200)
        .json({ message: "Profile image deleted successfully" });
    } else {
      return res.status(200).json({ message: "No profile image to delete" });
    }
  } catch (error) {
    console.error("Error in deleteProfileImage controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, bio } = req.body;

    // If a new image is uploaded
    if (req.file) {
      // Delete old image from S3 if it exists
      if (user.profileImageKey) {
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: user.profileImageKey,
        };
        try {
          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await s3.send(deleteCommand);
        } catch (deleteError) {
          console.error("Failed to delete old image:", deleteError);
        }
      }

      const imageName = `${Date.now()}_${req.file.originalname}`;
      const profileImageKey = `uploads/${imageName}`;
      const profileImageUrl = await uploadFileToS3(req.file, profileImageKey);

      user.profileImageUrl = profileImageUrl;
      user.profileImageKey = profileImageKey;
    }

    if (name) user.name = name;
    if (bio) user.bio = bio;

    await user.save();

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserDetails controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
