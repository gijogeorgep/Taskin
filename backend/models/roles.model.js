import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    permissions: [
      {
        type: String,
        enum: [
          "create_project",
          "edit_project",
          "delete_project",
          "assign_roles",
          "create_task",
          "edit_task",
          "delete_task",
          "comment",
          "view_all",
          "create_user",
          "edit_user",
          "delete_user",
          "view_projects",
          "view_tasks",
          "view_reports",
          "view_custom_fields",
        ],
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);

export default Role;
