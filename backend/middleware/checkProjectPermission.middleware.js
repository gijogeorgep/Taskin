import Task from "../models/task.model.js";
import ProjectPermission from "../models/ProjectPermissions.model.js";
import Project from "../models/project.model.js";

export const checkProjectPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const userId = user?._id;
      const globalRole = user?.globalRole?.name;

      let projectId =
        req.params.projectId || req.body?.project || req.query?.projectId;

      if (["admin", "manager", "Super Admin"].includes(globalRole)) {
        return next();
      }

      const taskId = req.params.taskId || req.params.id;

      if (!projectId && taskId) {
        const task = await Task.findById(taskId);
        if (!task) {
          return res.status(404).json({ message: "Task not found" });
        }
        if (!task.project) {
          return res
            .status(500)
            .json({ message: "Task has no project reference" });
        }
        projectId = task.project;
      }

      if (!projectId) {
        return res
          .status(400)
          .json({ message: "Project ID is required for permission check" });
      }

      const permissionDoc = await ProjectPermission.findOne({
        user: userId,
        project: projectId,
      });

      if (
        !permissionDoc ||
        !permissionDoc.permissions.includes(requiredPermission)
      ) {
        return res
          .status(403)
          .json({ message: "Permission denied for this project" });
      }

      next();
    } catch (error) {
      console.error("checkProjectPermission error:", error.message);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  };
};
