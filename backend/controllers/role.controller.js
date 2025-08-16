import Role from "../models/roles.model.js";

export const addRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    if (!name || !permissions || permissions.length === 0) {
      return res
        .status(400)
        .json({ message: "Name and permissions are required" });
    }

    const newRole = new Role({ name, permissions });
    await newRole.save();
    return res.status(200).json({ message: "Role added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    return res.status(200).json(roles);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    if (!roleId) {
      return res.status(400).json({ message: "Role ID is required" });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    await Role.findByIdAndDelete(roleId);
    return res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    if (!roleId) {
      return res.status(400).json({ message: "Role ID is required" });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    const { name, permissions } = req.body;

    console.log("Updating role:", roleId, name, permissions);
    role.name = name;
    role.permissions = permissions;
    await role.save();
    return res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
