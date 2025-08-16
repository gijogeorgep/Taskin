import mongoose from "mongoose";

const projectPermissionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
          "view_tasks",
          "edit_task",
          "view_reports",
          "view_all",
          "create_user",
          "edit_user",
          "delete_user",
          "view_projects",
          "view_custom_fields",
        ],
      },
    ],
  },
  { timestamps: true }
);

const ProjectPermission = mongoose.model(
  "ProjectPermission",
  projectPermissionSchema
);

export default ProjectPermission;
