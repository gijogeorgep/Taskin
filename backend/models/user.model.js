import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    globalRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    resetToken: String,
    resetTokenExpiry: Date,
    lastLogin: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    bio: {
      type: String,
      default: "",
    },
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      taskAssignments: { type: Boolean, default: true },
      projectUpdates: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
    },

    profileImageUrl: {
      type: String,
    },
    profileImageKey: {
      type: String,
    },


    profilePic: { type: String },






    customFieldData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },

  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
