import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import ProjectPermission from "../models/ProjectPermissions.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import Category from "../models/category.model.js";
import CustomField from "../models/customField.model.js";

export const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      createdBy,
      Budget,
      members,
      startDate,
      endDate,
      tasks = [],
      categories = [],
    } = req.body;

    const project = new Project({
      title,
      description,
      createdBy,
      Budget,
      startDate,
      endDate,
      members: members.map((m) => ({
        user: m.user,
        role: m.role,
      })),
    });

    await project.save();

    for (const member of project.members) {
      try {
        const user = await User.findById(member.user);
        if (!user) {
          res.status(400).json({ msg: "User not get in send project mail" });
        }

        if (user.notificationPreferences?.projectUpdates) {
          sendEmail(
            user.email,
            "New Project Assigned",
            `
        <h2>Hi ${user.name},</h2>
        <p>You have been added to the project <strong>${
          project.title
        }</strong>.</p>
        <p><strong>Status:</strong> ${project.status}</p>
        <p><strong>Start Date:</strong> ${new Date(
          project.startDate
        ).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(
          project.endDate
        ).toLocaleDateString()}</p>
        <p>Please check your project dashboard for more details.</p>
        <p>Regards,<br/>Task Management Team</p>
      `
          );
        }
        console.log("Email sent successfully");
      } catch (error) {
        console.log("error from update mail send", error);
      }
    }

    const permissionDocs = members.map((m) => ({
      project: project._id,
      user: m.user,
      permissions: m.permissions || [],
    }));

    await ProjectPermission.insertMany(permissionDocs);
    if (categories?.length > 0) {
      for (const catName of categories) {
        const trimmed = catName.trim();
        if (!trimmed) continue;

        const exists = await Category.findOne({
          name: trimmed,
          project: project._id,
        });

        if (!exists) {
          await Category.create({
            name: trimmed,
            project: project._id,
            tasks: [],
          });
        }
      }
    }

    if (tasks?.length > 0) {
      for (const task of tasks) {
        const taskData = {
          ...task,
          project: project._id,
        };

        let categoryDoc = null;

        if (typeof task.category === "string") {
          const categoryName = task.category.trim() || "Default Tasks";
          categoryDoc = await Category.findOne({
            name: categoryName,
            project: project._id,
          });

          if (!categoryDoc) {
            categoryDoc = await Category.create({
              name: categoryName,
              project: project._id,
            });
          }

          taskData.category = categoryDoc._id;
        }

        const createdTask = await Task.create(taskData);

        if (categoryDoc) {
          categoryDoc.tasks.push(createdTask._id);
          await categoryDoc.save();
        }

        project.tasks.push(createdTask._id);
      }

      await project.save();
    }

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("tasks", "title status dueDate priority")
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!projects || projects.length === 0) {
      return res.status(200).json({ msg: "No projects found" });
    }
    return res
      .status(200)
      .json({ projects, msg: "Projects fetched successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Error to fetching projects", error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      status,
      createdBy,
      members,
      description,
      Budget,
      startDate,
      endDate,
      tasks = [],
      categories = [],
    } = req.body;

    if (
      !title ||
      !status ||
      !members ||
      !description ||
      !Budget ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updated = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }

    for (const member of members) {
      if (!member.user) continue;

      if (member.permissions && member.permissions.length > 0) {
        await ProjectPermission.findOneAndUpdate(
          { project: id, user: member.user },
          {
            project: id,
            user: member.user,
            permissions: member.permissions,
          },
          { upsert: true, new: true }
        );
      } else {
        await ProjectPermission.findOneAndDelete({
          project: id,
          user: member.user,
        });
      }
    }

    for (const member of updated.members) {
      try {
        const user = await User.findById(member.user);
        if (!user) continue;

        const shouldSend =
          user.notificationPreferences?.projectUpdates !== false;

        if (shouldSend) {
          sendEmail(
            user.email,
            "Project Updated",
            `
              <h2>Hi ${user.name},</h2>
              Your assigned project <strong>${
                updated.title
              }</strong> has been updated.
              <p><strong>Status:</strong> ${updated.status}</p>
              <p><strong>Start Date:</strong> ${new Date(
                updated.startDate
              ).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> ${new Date(
                updated.endDate
              ).toLocaleDateString()}</p>
              <p>Please check your dashboard for more details.</p>
              <p>Regards,<br/>Task Management Team</p>
            `
          );
        }
        console.log("Mail send successfully");
        // console.log(user.notificationPreferences?.projectUpdates, "mail send");
        // console.log("and faild to send");
      } catch (error) {
        console.log("Error sending update email:", error);
      }
    }

    return res
      .status(200)
      .json({ project: updated, msg: "Project updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Project update failed", error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Project.findOneAndDelete({ _id: id });
    if (!deleted) {
      return res.status(404).json({ msg: "Project not found" });
    }
    await Task.deleteMany({ project: id });
    res.status(200).json({ msg: "Project deleted successfully", deleted });
  } catch (error) {
    return res.status(500).json({ msg: "operation failed" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ msg: "Project ID is required" });

    const project = await Project.findById(id)
      .populate("tasks", "title status dueDate priority")
      .populate("createdBy", "name email")
      .populate("members.user", "name email")
      .populate("members.role", "name");

    if (!project) return res.status(404).json({ msg: "Project not found" });

    const customField = await CustomField.find({
      appliesTo: "projects",
      target: project._id,
    });

    const projectPermissions = await ProjectPermission.find({
      project: id,
    }).populate("user", "name email");

    const enrichedCustomField = customField.map((field) => ({
      ...field._doc,
      value: project.customFieldData?.[field.fieldName] || "",
    }));

    const projectWithCustomField = {
      ...project._doc,
      customField: enrichedCustomField,
      projectPermissions,
    };

    return res.status(200).json({ project: projectWithCustomField });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Error fetching project", error: error.message });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    const projects = await Project.find({ members: userId })
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!projects || projects.length === 0) {
      return res.status(404).json({ msg: "No projects found for this user" });
    }
    return res
      .status(200)
      .json({ projects, msg: "User projects fetched successfully" });
  } catch (error) {
    return res

      .status(500)
      .json({ msg: "Error fetching user projects", error: error.message });
  }
};

export const updateProjectProgress = async (projectId) => {
  try {
    if (!projectId) {
      throw new Error("No project ID provided");
    }

    const tasks = await Task.find({ project: projectId });

    if (!tasks || tasks.length === 0) {
      await Project.findByIdAndUpdate(projectId, { progress: 0 });
      console.log(`Progress for project ${projectId} set to 0% (no tasks).`);
      return 0;
    }

    const completedTasks = tasks.filter((task) => task.status === "done");
    const progress = Math.round((completedTasks.length / tasks.length) * 100);

    await Project.findByIdAndUpdate(projectId, { progress });
    console.log(
      `Progress for project ${projectId} updated to ${progress}% (${completedTasks.length}/${tasks.length} tasks completed)`
    );

    return progress;
  } catch (error) {
    console.error("Error updating project progress:", error.message);
    throw new Error("Failed to update project progress");
  }
};

export const getProjectTaskStatusSummary = async (req, res) => {
  try {
    const projects = await Project.find().select(
      "_id title startDate createdAt"
    );

    const summaries = [];

    for (const project of projects) {
      const tasks = await Task.find({ project: project._id });

      const summary = {
        projectId: project._id,
        projectTitle: project.title,
        projectStartDate: project.startDate,
        projectCreatedAt: project.createdAt,
        todo: 0,
        inProgress: 0,
        done: 0,
        projectDue: 0,
        blocked: 0,
      };

      for (const task of tasks) {
        switch (task.status.toLowerCase()) {
          case "todo":
            summary.todo++;
            break;
          case "inprogress":
            summary.inProgress++;
            break;
          case "done":
            summary.done++;
            break;
          case "due":
            summary.projectDue++;
            break;
          case "blocked":
            summary.blocked++;
            break;
          default:
            break;
        }
      }

      summaries.push(summary);
    }

    res.status(200).json(summaries);
  } catch (err) {
    console.error("Error fetching project task status summaries:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const updateProjectStatus = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ msg: "No project ID provided" });
  }

  try {
    const tasks = await Task.find({ project: projectId });
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    let progress = 0;
    let status = project.status || "default status";

    if (tasks.length === 0) {
      progress = 0;
      status = "planned";
    } else {
      const completedTasks = tasks.filter((task) => task.status === "done");
      progress = Math.round((completedTasks.length / tasks.length) * 100);

      if (status !== "cancelled" && status !== "on hold") {
        const hasTodo = tasks.some(
          (task) => progress < 100 || task.status === "inprogress"
        );
        const hasOverdue = tasks.some(
          (task) =>
            task.status !== "done" && new Date(project.endDate) < new Date()
        );

        if (progress === 100) {
          status = "completed";
        } else if (hasOverdue) {
          status = "due";
        } else if (hasTodo) {
          status = "in progress";
        }
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { progress, status },
      { new: true }
    ).populate("members.user", "name email");

    return res.status(200).json({
      msg: "Project status updated",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project status:", error);
    return res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};
