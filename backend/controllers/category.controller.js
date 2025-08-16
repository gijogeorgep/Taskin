import Category from "../models/category.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { updateProjectProgress } from "./project.controller.js";

export const createCategory = async (req, res) => {
  try {
    const { name, project } = req.body;

    if (!name || !project) {
      return res.status(400).json({ message: "Name and project are required" });
    }

    const newCategory = await Category.create({ name, project });
    return res
      .status(201)
      .json({ message: "Category created", category: newCategory });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create category", error });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "Missing project ID" });
    }

    let categories = await Category.find({ project: projectId });

    // Check if "Default Tasks" exists
    const defaultExists = categories.find(
      (cat) => cat.name === "Default Tasks"
    );

    if (!defaultExists) {
      const defaultCategory = await Category.create({
        name: "Default Tasks",
        project: projectId,
        tasks: [],
      });

      categories.push(defaultCategory);
    }

    res.status(200).json({ categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

export const addTaskToCategory = async (req, res) => {
  try {
    let { categoryId } = req.params;
    const taskData = req.body;

    console.log("Received categoryId:", categoryId);

    if (!taskData.project) {
      return res
        .status(400)
        .json({ message: "Project ID is required in task data" });
    }

    if (!categoryId || categoryId === "null" || categoryId === "undefined") {
      let defaultCategory = await Category.findOne({
        name: "Default Tasks",
        project: taskData.project,
      });

      if (!defaultCategory) {
        defaultCategory = await Category.create({
          name: "Default Tasks",
          project: taskData.project,
          tasks: [],
        });
      }

      console.log("Original status bef:", taskData.status);

      categoryId = defaultCategory._id;
    }
    const projectDoc = await Project.findById(taskData.project);
    if (!projectDoc) {
      return res.status(404).json({ message: "Project not found" });
    }

    const dueDate = taskData.dueDate;
    let adjustedStatus = taskData.status;
    if (dueDate < new Date(projectDoc.endDate) && adjustedStatus !== "done") {
      adjustedStatus = "due";
    }
    if (new Date(dueDate) > new Date(projectDoc.endDate)) {
      adjustedStatus = "due";
    }

    console.log("Adjusted status aft:", adjustedStatus);
    const newTask = await Task.create({
      ...taskData,
      category: categoryId,
      status: adjustedStatus,
    });

    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    category.tasks.push(newTask._id);
    await category.save();

    const project = await Project.findById(newTask.project);
    if (project) {
      project.tasks.push(newTask._id);
      await project.save();
    }
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await updateProjectProgress(newTask.project);

    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedTo", "name email")
      .populate("project", "title");
    console.log(populatedTask, "populate");

    const user = await User.findById(populatedTask.assignedTo._id);
    try {
      console.log("Checking email notification settings for:", user?.email);

      const notificationEnabled =
        user?.notificationPreferences?.taskAssignments ?? true;
      console.log(notificationEnabled);

      if (notificationEnabled) {
        console.log("Sending task email to:", user.email);

        await sendEmail(
          user.email,
          "New Task Assigned",
          ` <h2>Hi ${user.name},</h2>
    <p>You’ve been assigned a new task in project <b>${
      populatedTask.project?.title || "your project"
    }</b>.</p>
    <ul>
      <li><strong>Title:</strong> ${populatedTask.title}</li>
      <li><strong>Priority:</strong> ${populatedTask.priority}</li>
      <li><strong>Due Date:</strong> ${new Date(
        populatedTask.dueDate
      ).toLocaleDateString()}</li>
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
    const updatedCategory = await Category.findById(categoryId).populate(
      "tasks"
    );

    res.status(201).json({
      message: "Task added to category successfully",
      updatedCategory,
    });
  } catch (error) {
    console.error("Add task to category failed:", error);
    res.status(500).json({ message: "Failed to add task to category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Task.deleteMany({ category: categoryId });

    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({ message: "Category and its tasks deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res
      .status(500)
      .json({ message: "Failed to delete category", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = name;
    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
};
