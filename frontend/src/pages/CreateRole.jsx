import React, { useEffect, useState } from "react";
import { useRoleStore } from "../store/useRoleStore.js";

const CreateRole = () => {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);

  const {
    addRole,
    getRoles,
    editRole,
    deleteRole,
    roles,
    isloading,
    error,
    success,
  } = useRoleStore();

  useEffect(() => {
    getRoles();
  }, [getRoles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoleId) {
        await editRole(editingRoleId, name, permissions);
        setEditingRoleId(null);
      } else {
        await addRole(name, permissions);
      }
      setName("");
      setPermissions([]);
      getRoles();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditClick = (role) => {
    setEditingRoleId(role._id);
    setName(role.name);
    setPermissions(role.permissions);
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
    setName("");
    setPermissions([]);
  };

  const handleDeleteClick = async (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRole(roleId);
        getRoles(); // Refresh roles after deletion
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setPermissions((prev) =>
      checked ? [...prev, value] : prev.filter((perm) => perm !== value)
    );
  };

  const permissionOptions = [
    { label: "Create Project", value: "create_project" },
    { label: "Edit Project", value: "edit_project" },
    { label: "Delete Project", value: "delete_project" },
    { label: "Assign Roles", value: "assign_roles" },
    { label: "Create Task", value: "create_task" },
    { label: "Delete Task", value: "delete_task" },
    { label: "Comment", value: "comment" },
    { label: "View All", value: "view_all" },
    { label: "Create User", value: "create_user" },
    { label: "Edit User", value: "edit_user" },
    { label: "Delete User", value: "delete_user" },
    { label: "View Projects", value: "view_projects" },
    { label: "View Tasks", value: "view_tasks" },
    { label: "View Reports", value: "view_reports" },
    { label: "View Custom Fields", value: "view_custom_fields" },
  ];

  const permissionLabelMap = permissionOptions.reduce((acc, curr) => {
    acc[curr.value] = curr.label;
    return acc;
  }, {});

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen text-white px-4 py-6 md:px-8 lg:pl-[19%]">
      <div className="flex flex-col md:flex-row gap-8">
        {/* CREATE/EDIT ROLE FORM */}
        <div className="bg-white p-6 rounded-xl shadow-md w-full md:w-1/2 border border-gray-200">
  <h2 className="text-2xl font-semibold mb-4 border-b border-gray-300 pb-2 text-gray-800">
    {editingRoleId ? "Edit Role" : "Create Role"}
  </h2>

  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
    {/* Role Name */}
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
        Role Name
      </label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter role name"
        className="mt-1 w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
      />
    </div>

    {/* Permissions */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Permissions
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
        {permissionOptions.map((perm) => (
          <label
            key={perm.value}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition"
          >
            <input
              type="checkbox"
              className="form-checkbox text-blue-600 rounded focus:ring-blue-500"
              value={perm.value}
              checked={permissions.includes(perm.value)}
              onChange={handleCheckboxChange}
            />
            <span className="text-sm text-gray-700">{perm.label}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-3">
      <button
        type="submit"
        className="mt-2 flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {isloading
          ? editingRoleId
            ? "Updating..."
            : "Creating..."
          : editingRoleId
          ? "Update Role"
          : "Create Role"}
      </button>

      {editingRoleId && (
        <button
          type="button"
          onClick={handleCancelEdit}
          className="mt-2 flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>

    {/* Messages */}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    {success && <p className="text-green-600 text-sm mt-1">{success}</p>}
  </form>
</div>


        {/* EXISTING ROLES */}
       <div className="bg-white p-6 rounded-xl shadow-md w-full md:w-1/2 border border-gray-200">
  <h2 className="text-2xl font-semibold mb-4 border-b border-gray-300 pb-2 text-gray-800">
    Existing Roles
  </h2>

  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
    {roles && roles.length > 0 ? (
      roles.map((role) => (
        <div
          key={role._id}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start gap-2 hover:shadow-md transition-shadow"
        >
          {/* Role Name + Permissions */}
          <div>
            <h3 className="text-lg font-bold text-blue-600">
              {role.name}
            </h3>

            {/* Permissions as badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              {(role.permissions || []).map((perm) => (
                <span
                  key={perm}
                  className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full border border-blue-200"
                >
                  {permissionLabelMap[perm] || perm}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          {role?.name !== "admin" ? (
            <div className="flex flex-col gap-2 ml-auto">
              <button
                onClick={() => handleEditClick(role)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-lg text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(role._id)}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-lg text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => handleEditClick(role)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-lg text-sm transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      ))
    ) : (
      <p className="text-gray-500">No roles found.</p>
    )}
  </div>
</div>

      </div>
    </div>
  );
};

export default CreateRole;
