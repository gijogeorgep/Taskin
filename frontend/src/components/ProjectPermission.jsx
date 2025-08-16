function ProjectPermission() {
  const permissionOptions = [
    { label: "Create task", value: "create_task" },
    { label: "Edit task", value: "edit_task" },
    { label: "Delete task", value: "delete_task" },
    { label: "View tasks", value: "view_tasks" },

    { label: "Assign task", value: "assign_task" },
    { label: "Comment", value: "comment" },
    { label: "Edit User", value: "edit_user" },
    { label: "Remove User", value: "Remove_user" },
   
  ];
  return (
    <>
      {" "}
      <div className="bg-gray-900 min-h-screen text-white px-4 py-6 md:px-8 md:ml-64">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full md:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 border-b border-gray-600 pb-2"></h2>
            <form className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Role Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  placeholder="Enter Role name"
                  className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-700 p-3 rounded-md border border-gray-700">
                  {permissionOptions.map((perm) => (
                    <label key={perm.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="form-checkbox text-blue-600"
                        value={perm.value}
                      />
                      <span className="text-sm">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProjectPermission;
