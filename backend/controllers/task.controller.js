import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { updateProjectProgress } from "./project.controller.js";
import Category from "../models/category.model.js";
import Project from "../models/project.model.js";
import CustomField from "../models/customField.model.js";

export const AddTask = async (req, res) => {
  console.log("AddTask called");
  console.log("Request body:", req.body);
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
      category,
    } = req.body;

    if (
      !title ||
      !description ||
      !project ||
      !assignedTo ||
      !status ||
      !priority ||
      !dueDate ||
      !category
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required in AddTask" });
    }

    const newTask = new Task({
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
      category,
    });

    await newTask.save();

    const categoryDoc = await Category.findById(category);
    if (categoryDoc) {
      categoryDoc.tasks.push(newTask._id);
      await categoryDoc.save();
    }

    await updateProjectProgress(project);

    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedTo", "name email")
      .populate("project", "title");
    const user = await User.findById(assignedTo);
    try {
      console.log("Checking email notification settings for:", user?.email);

      const notificationEnabled =
        user?.notificationPreferences?.taskAssignments ?? true;
      console.log(notificationEnabled);

      if (notificationEnabled) {
        console.log("Sending task email to:", user.email);

        sendEmail(
          user.email,
          "New Task Assigned",
          ` <h2>Hi ${user.name},</h2>
<p>You’ve been assigned a new task in project <b>${
            populatedTask.project?.title || "your project"
          }</b>.</p>
<ul>
  <li><strong>Title:</strong> ${title}</li>
  <li><strong>Priority:</strong> ${priority}</li>
  <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</li>
</ul>
<p>Check your task dashboard for more details.</p>`
        );

        console.log("Email sent successfully");
      } else {
        console.log(
          ` Email skipped: User ${user.email} disabled task notifications.`
        );
      }
    } catch (emailError) {
      console.error(" Failed to send email:", emailError);
    }

    return res.status(200).json({ newTask: populatedTask });
  } catch (error) {
    console.log(error, "Error from AddTask ");
    return res.status(500).json({ msg: "Error from AddTask", error });
  }
};

export const getAllTask = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("project", "title")
      .populate("category", "name")
      .populate("comments.createdBy", "name");

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ msg: "No task found" });
    }
    return res.status(200).json({ tasks });
  } catch (error) {
    console.log(error, "Error from getAllTask");
    return res.status(500).json({ msg: "Error from getAllTask", error });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await updateProjectProgress(deletedTask.project);
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error, "Error from deleteTask");
    return res.status(500).json({ msg: "Error from deleteTask", error });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskData = req.body;

    const {
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
      category,
      customFieldData,
    } = req.body;
    console.log("Original status task bef:", status);

    const projectDoc = await Project.findById(taskData.project);
    if (!projectDoc) {
      return res.status(404).json({ message: "Project not found" });
    }

    const dueDated = taskData.dueDate;
    let adjustedStatus = taskData.status;
    console.log(adjustedStatus, "adjustedStatus");

    if (dueDated < new Date(projectDoc.endDate) && adjustedStatus !== "done") {
      adjustedStatus = "due";
    }
    if (
      new Date() > new Date(projectDoc.endDate) &&
      adjustedStatus !== "done"
    ) {
      adjustedStatus = "due";
    }

    console.log("Adjusted status aft task:", adjustedStatus);

    if (
      !title ||
      !description ||
      !project ||
      !assignedTo ||
      !status ||
      !priority ||
      !dueDate ||
      !category
    ) {
      console.log("All fields are required ");

      return res
        .status(400)
        .json({ message: "All fields are required from update backend" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title,
        description,
        project,
        assignedTo,
        status: adjustedStatus,
        priority,
        dueDate,
        category,
        customFieldData,
      },
      { new: true }
    )
      .populate("assignedTo", "name email")
      .populate("project", "title");

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await updateProjectProgress(project);
    const user = await User.findById(assignedTo);
    try {
      if (user?.notificationPreferences?.taskAssignments) {
        // await
        sendEmail(
          user.email,
          "Updated Task",
          ` <h2>Hi ${user.name},</h2>


        <p>Your assigned task has been <strong>updated</strong> in the project <strong>${
          updatedTask.project.title
        }</strong>.</p>

<ul>
  <li><strong>Title:</strong> ${title}</li>
  <li><strong>Priority:</strong> ${priority}</li>
  <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</li>
</ul>
<p>Check your task dashboard for more details.</p>`
        );
      }
      console.log("Email sent successfully");

      // console.log(user?.notificationPreferences, "notificationPreferences tasknn");
    } catch (error) {
      console.log("error from update mail send", error);
    }

    return res.status(200).json({ message: "Task updated", updatedTask });
  } catch (error) {
    console.error("Error from updateTask:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate("assignedTo", "name email")
      .populate("project", "title")
      .populate("comments.createdBy", "name")
      .lean();
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const customFields = await CustomField.find({
      appliesTo: "tasks",
      target: task._id,
    }).lean();

    const enrichedCustomFields = customFields.map((field) => ({
      ...field,
      value: task.customFieldData?.[field.fieldName] || "",
    }));

    const taskWithCustomField = {
      ...task,
      customFields: enrichedCustomFields,
    };

    // console.log("task with custom filed", taskWithCustomField);

    return res.status(200).json({ task: taskWithCustomField });
  } catch (error) {
    console.error("Error from getTaskById:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getTaskByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo", "name email")
      .populate("project", "title")
      .populate("comments.createdBy", "name");

    if (!tasks || tasks.length === 0) {
      return res
        .status(404)
        .json({ message: "No tasks found for this project" });
    }
    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error from getTaskByProjectId:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    if (!userId) return res.status(404).json({ message: "User not found" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const newComment = { text, createdBy: userId };
    task.comments.push(newComment);
    await task.save();

    const populatedTask = await Task.findById(taskId).populate(
      "comments.createdBy",
      "name"
    );
    const lastComment = populatedTask.comments.at(-1);

    res.status(200).json({ comment: lastComment });
  } catch (error) {
    console.log("Server error addComment");
    res.status(500).json({ message: "Server error addComment", error });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { text } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = task.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    comment.text = text;
    await task.save();

    res.status(200).json({ comment });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: "Server error in updateComment", error });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.comments = task.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );
    await task.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error in delete comment", error });
  }
};
