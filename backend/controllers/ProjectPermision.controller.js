import ProjectPermission from "../models/ProjectPermissions.model.js";

export const createProjectPermission = async (req, res) => {
  try {
    const { projectID, user, permissions } = req.body;

    if (!projectID || !user || !permissions) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPermission = new ProjectPermission({
      project: projectID,
      user,
      permissions,
    });

    await newPermission.save();
    return res.status(201).json({
      message: "Project permission created successfully",
      newPermission,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating project permission",
      error: error.message,
    });
  }
};

export const getProjectPermissions = async (req, res) => {
  try {
    const { projectID } = req.params;

    if (!projectID) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const permissions = await ProjectPermission.find({ project: projectID })
      .populate("user", "name email")
      .populate("project", "name description");

    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching project permissions",
      error: error.message,
    });
  }
};

export const updateProjectPermission = async (req, res) => {
  try {
    const { permissionID } = req.params;
    const { permissions } = req.body;

    if (!permissionID || !permissions) {
      return res
        .status(400)
        .json({ message: "Permission ID and permissions are required" });
    }

    const updatedPermission = await ProjectPermission.findByIdAndUpdate(
      permissionID,
      { permissions },
      { new: true }
    );

    if (!updatedPermission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    return res.status(200).json({
      message: "Project permission updated successfully",
      updatedPermission,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating project permission",
      error: error.message,
    });
  }
};



export const deleteProjectPermission = async (req, res) => {
  try {
    const { permissionID } = req.params;

    if (!permissionID) {
      return res.status(400).json({ message: "Permission ID is required" });
    }

    const deletedPermission = await ProjectPermission.findByIdAndDelete(
      permissionID
    );

    if (!deletedPermission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    return res.status(200).json({
      message: "Project permission deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting project permission",
      error: error.message,
    });
  }
};


