// controllers/auth.controller.js
import User from "../models/user.model.js";
import Role from "../models/roles.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/tokenGenerator.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import CustomField from "../models/customField.model.js";
export const addUser = async (req, res) => {
  try {
    const { name, email, password, roleName } = req.body;

    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({ message: "Role not found" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      globalRole: role._id,
      bio: "", // Initialize bio as empty string
      
    });

    const inviterName = req.user?.name;
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const inviteLink = `${process.env.FRONTEND_URL}/change-password/${token}`;
    await newUser.save();
    sendEmail(
      email,
      "Welcome to Project Management App",
      `

         <p><strong>${inviterName}</strong> has invited you to join our Project Management App.</p>
    <p>Your account has been created. You can now log in using your email ${newUser.email}.</p>
        <p>Please change your password and access your account. Click the button below!</p>

   
<p>
  <a href="${inviteLink}" 
     style="background:#111827;color:#fff;padding:10px 15px;border-radius:5px;text-decoration:none;">
    Login Now
  </a>

</p>
<p>The Link will be expire within 24h please access your account.</p>
    <p>If you have questions, please contact Admin.</p>
    <p>Regards,<br/>The Project Management Team</p>
      `
    );

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: role.name,
      bio: newUser.bio || "",
    });
  } catch (error) {
    console.error("Error in addUser controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// export const autoLogin = async (req, res) => {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({ message: "Token is required" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     console.log("Token received:", token);
//     console.log("User found:", user.name);
//     generateToken(user._id, res);
//     console.log("JWT cookie should be set for:", user._id);

//     return res.status(200).json({ message: "Logged in successfully" });
//   } catch (error) {
//     console.error("Login failed:", error.message);

//     return res.status(401).json({ message: "Invalid or expired link" });
//   }
// };

export const changePassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    if (!token) return res.status(400).json({ message: "Token required." });

    if (!password)
      return res.status(400).json({ message: "Password required." });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired. Please contact Admin.",
        });
      }
      return res.status(401).json({ message: "Invalid token." });
    }

    const user = await User.findById(decoded.userId);

    user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.status(200).json({ message: "Password change successfully." });
  } catch (error) {
    console.log("error from change password", error);
    return res
      .status(500)
      .json({ message: "Internal server error change password", error });
  }
};

/////

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("globalRole");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.status === "inactive") {
      return res
        .status(403)
        .json({ message: "Your account is inactive. Please contact admin." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    user.lastLogin = new Date();
    await user.save();

    generateToken(user._id, res);

    const customField = await CustomField.find({
      appliesTo: "users",
      target: user._id,
    });

    const enrichedCustomFields = customField.map((field) => ({
      ...field._doc,
      value: user.customFieldData?.[field.fieldName] ?? field.value ?? "",
    }));

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.globalRole.name,
      permissions: user.globalRole.permissions,
      lastLogin: user.lastLogin,
      bio: user.bio || "",
      profilePic: user.profilePic || "",
      customField: enrichedCustomFields,
    });
  } catch (error) {
    console.error("Error in loginUser controller:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const logoutUser = (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 0,
    });
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error in logoutUser controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("globalRole");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const customField = await CustomField.find({
      appliesTo: "users",
      target: user._id,
    });

    const enrichedCustomFields = customField.map((field) => ({
      ...field._doc,
      value: user.customFieldData?.[field.fieldName] ?? field.value ?? "",
    }));

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.globalRole?.name || "N/A",
      profilePic: user.profilePic || "",
      bio: user.bio || "",
      permissions: user.globalRole?.permissions || [],
      customField: enrichedCustomFields,
    });
  } catch (error) {
    console.log("Error in checkAuth controller: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editUser = async (req, res) => {
  try {
    const { name, bio, profilePic, roleName, status } = req.body;
    const userId = req.params.userId;

    if (!name) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({ message: "Role not found" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.globalRole = role._id;
    user.bio = bio || user.bio; // Update bio if provided
    user.profilePic = profilePic || user.profilePic;

    if (status) user.status = status;
    await user.save();

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      bio: user.bio || "",
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in editUser controller:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("globalRole", "name permissions")
      .select("-password");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const taskCount = await Task.countDocuments({ assignedTo: user._id });
        const projectCount = await Project.countDocuments({
          "members.user": user._id,
        });

        return {
          ...user.toObject(),
          taskCount,
          projectCount,
          lastLogin: user.lastLogin || null,
        };
      })
    );

    return res.status(200).json(usersWithCounts);
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsersWithInactive = async (req, res) => {
  try {
    const users = await User.find()
      .populate("globalRole", "name permissions")
      .select("-password");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const taskCount = await Task.countDocuments({ assignedTo: user._id });
        const projectCount = await Project.countDocuments({
          "members.user": user._id,
        });

        return {
          ...user.toObject(),
          taskCount,
          projectCount,
          lastLogin: user.lastLogin || null,
        };
      })
    );

    return res.status(200).json(usersWithCounts);
  } catch (error) {
    console.error("Error in getAllUserswith inactive controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId || userId === "undefined") {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId)
      .populate("globalRole", "name permissions")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all custom fields for this user
    const customFields = await CustomField.find({
      appliesTo: "users",
      target: userId,
    });

    // Merge values from user.customFieldData
    const enrichedCustomFields = customFields.map((field) => ({
      ...field._doc,
      value: user.customFieldData?.[field.fieldName] ?? "",
    }));

    return res.status(200).json({
      user: {
        ...user._doc,
        customField: enrichedCustomFields,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ message: "Email is required from forgot password" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "User not found from forgot password" });

    const token = jwt.sign({ id: user._id }, process.env.RESET_PASSWORD_KEY, {
      expiresIn: "15m",
    });

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();
    console.log(token, "dout token forgot");
    console.log(user, "dout user forgot");

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendEmail(
      user.email,
      "Reset your password",
      `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    );

    res.json({ message: "Reset email sent" });
  } catch (error) {
    console.error("forgotPassword Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) return res.status(400).json({ message: "Token required." });

    if (!password)
      return res.status(400).json({ message: "Password required." });

    // Changes neeed setup this in frontend
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });

    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_KEY);
    const user = await User.findById(decoded.id);
    console.log(decoded, "This is decoded token resetPassword");

    if (!user || user.resetToken !== token)
      return res.status(400).json({ message: "Invalid or expired token" });

    if (Date.now() > user.resetTokenExpiry)
      return res.status(400).json({ message: "Token expired." });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    console.log(token, "dout token reset");
    console.log(user, "dout user reset");
    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ message: "Token not found" });

    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_KEY);

    const user = await User.findById(decoded.id);

    if (!user || user.resetToken !== token) {
      return res.status(400).json({ message: "Invalid or reused token" });
    }

    if (Date.now() > user.resetTokenExpiry) {
      return res.status(400).json({ message: "Token expired" });
    }

    return res.status(200).json({ message: "Token valid" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

export const updateNotificationPreference = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId, "user id");

    const {
      emailNotifications,
      taskAssignments,
      projectUpdates,
      weeklyReports,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notificationPreferences = {
      emailNotifications,
      taskAssignments,
      projectUpdates,
      weeklyReports,
    };
    console.log(user.notificationPreferences, "notification preferences");

    await user.save();
    console.log(user, "notification preferences");

    res.status(200).json({
      message: "Notification preferences updated successfully",
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, bio, profilePic, customFieldData } = req.body;

    const updateFields = {
      name,
      bio,
      ...(profilePic !== undefined && {
        profilePic: profilePic === "" ? null : profilePic,
      }),
      ...(customFieldData && { customFieldData }),
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).populate("globalRole");

    if (customFieldData && typeof customFieldData === "object") {
      for (const [fieldName, value] of Object.entries(customFieldData)) {
        await CustomField.findOneAndUpdate(
          { fieldName, appliesTo: "users", target: userId },
          { $set: { value } },
          { upsert: true, new: true }
        );
      }
    }

    const updatedCustomFields = await CustomField.find({
      appliesTo: "users",
      target: userId,
    });

    const enrichedFields = updatedCustomFields.map((field) => ({
      ...field._doc,
      value: customFieldData?.[field.fieldName] ?? field.value ?? "",
    }));

    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.globalRole?.name,
      permissions: updatedUser.globalRole?.permissions,
      profilePic: updatedUser.profilePic || "",
      bio: updatedUser.bio || "",
      customField: enrichedFields,
      lastLogin: updatedUser.lastLogin,
    });
  } catch (error) {
    console.error("Failed to update profile", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePasswordSetting = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
