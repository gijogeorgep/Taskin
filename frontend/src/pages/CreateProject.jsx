import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useProjectStore } from "../store/useProjectStore";
import { useAuthStore } from "../store/useAuthStore";
import ProjectMembersCard from "../components/ProjectMembersCard";

// Skeleton Components
const SkeletonBox = ({ width = "w-full", height = "h-4", className = "" }) => (
  <div
    className={`bg-gray-200 animate-pulse rounded ${width} ${height} ${className}`}
  />
);
const SkeletonHeader = () => (
  <div className="flex items-center gap-4 mb-6">
    <SkeletonBox width="w-10" height="h-8" />
    <div>
      <SkeletonBox width="w-48" height="h-8" />
      <SkeletonBox width="w-32" height="h-4" className="mt-2" />
    </div>
  </div>
);
const SkeletonProjectDetails = () => (
  <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
    <SkeletonBox width="w-1/3" height="h-6" className="mb-4" />
    <SkeletonBox height="h-10" className="mb-4" />
    <SkeletonBox height="h-20" className="mb-4" />
    <SkeletonBox width="w-1/4" height="h-4" className="mb-1" />
    <SkeletonBox height="h-10" className="mb-4" />
    <SkeletonBox width="w-1/4" height="h-4" className="mb-1" />
    <SkeletonBox height="h-10" />
  </div>
);
const SkeletonAddMembers = () => (
  <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm ml-8">
    <SkeletonBox width="w-1/3" height="h-6" className="mb-4" />
    <div className="space-y-4">
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <SkeletonBox width="w-8" height="h-8" className="rounded-full" />
          <div className="flex-1 space-y-1">
            <SkeletonBox width="w-1/2" height="h-4" />
            <SkeletonBox width="w-1/3" height="h-4" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
const SkeletonButtons = () => (
  <div className="flex justify-end gap-4 mt-10">
    <SkeletonBox width="w-24" height="h-10" />
    <SkeletonBox width="w-32" height="h-10" />
  </div>
);

const CreateProject = () => {
  const { addProject } = useProjectStore();
  const { getAllUsers, allUsers, authUser } = useAuthStore();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [taskCategories, setTaskCategories] = useState([
    {
      name: "Default Tasks",
      tasks: [
        {
          title: "",
          description: "",
          assignedTo: "",
          priority: "medium",
          dueDate: "",
        },
      ],
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [dueDate, setDueDate] = useState("");
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        await getAllUsers();
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [getAllUsers]);

  const handleMemberToggle = (userId) => {
    const exists = selectedMembers.find((m) => m.user === userId);
    if (exists) {
      setSelectedMembers((prev) => prev.filter((m) => m.user !== userId));
    } else {
      const user = allUsers.find((u) => u._id === userId);
      const roleName = user?.globalRole?.name;

      if (user?.globalRole?._id && roleName) {
        const defaultPermissions = user?.globalRole?.permissions || [];
        console.log(
          defaultPermissions,
          "Default permissions log from Create project"
        );

        setSelectedMembers((prev) => [
          ...prev,
          {
            user: userId,
            role: user.globalRole._id,
            permissions: defaultPermissions,
          },
        ]);
      } else {
        alert("This user has no global role assigned.");
      }
      console.log("slected members", selectedMembers);
    }
  };

  const handlePermissionChange = (index, permission) => {
    const updated = [...selectedMembers];
    const currentPermissions = updated[index].permissions;
    updated[index].permissions = currentPermissions.includes(permission)
      ? currentPermissions.filter((p) => p !== permission)
      : [...currentPermissions, permission];
    setSelectedMembers(updated);
  };

  const handleTaskChange = (catIndex, taskIndex, field, value) => {
    const updatedCategories = [...taskCategories];
    updatedCategories[catIndex].tasks[taskIndex][field] = value;
    setTaskCategories(updatedCategories);
  };

  const handleAddTask = (catIndex) => {
    const updated = [...taskCategories];
    updated[catIndex].tasks.push({
      title: "",
      description: "",
      assignedTo: "",
      priority: "medium",
      dueDate: "",
    });
    setTaskCategories(updated);
  };

  const handleRemoveTask = (catIndex, taskIndex) => {
    const updated = [...taskCategories];
    updated[catIndex].tasks.splice(taskIndex, 1);
    setTaskCategories(updated);
  };

  const startDateRef = useRef();
  const endDateRef = useRef();
  const taskDaeteRf = useRef();

  const handleOpenStartDate = () => {
    if (startDateRef.current?.showPicker) {
      startDateRef.current.showPicker();
    } else {
      startDateRef.current?.focus();
    }
  };

  const handleOpenDeadline = () => {
    if (endDateRef.current?.showPicker) {
      endDateRef.current.showPicker();
    } else {
      endDateRef.current?.focus();
    }
  };

  const handleTaskDate = () => {
    if (taskDaeteRf.current?.showPicker) {
      taskDaeteRf.current.showPicker();
    } else {
      taskDaeteRf.current?.focus();
    }
  };

  const handleAddCategory = () => {
    setTaskCategories([
      ...taskCategories,
      {
        name: "",
        tasks: [
          {
            title: "",
            description: "",
            assignedTo: "",
            priority: "medium",
            dueDate: "",
          },
        ],
      },
    ]);
  };

  const handleCategoryNameChange = (index, value) => {
    const updated = [...taskCategories];
    updated[index].name = value;
    setTaskCategories(updated);
  };

  const handleRemoveCategory = (index) => {
    const updated = [...taskCategories];
    updated.splice(index, 1);
    setTaskCategories(updated);
  };

  const handleCreate = async () => {
    setCreateLoading(true);
    if (!authUser?._id)
      return alert("You must be logged in to create a project");

    if (
      !projectName ||
      !description ||
      !startDate ||
      !deadline ||
      !budget ||
      selectedMembers.length === 0
    ) {
      return alert("Please fill in all required fields");
    }

    const categories = taskCategories.map((cat) =>
      typeof cat.name === "string"
        ? cat.name.trim() || "Default Tasks"
        : "Default Tasks"
    );

    const filteredTasks = taskCategories.flatMap((category) =>
      category.tasks
        .filter((task) => task.title.trim())
        .map((task) => ({
          ...task,
          category: category.name || "Default Tasks",
        }))
    );

    const projectData = {
      title: projectName.trim(),
      description: description.trim(),
      createdBy: authUser._id,
      Budget: Number(budget),
      members: selectedMembers,
      startDate,
      endDate: deadline,
      tasks: filteredTasks,
      categories,
    };
    try {
      await addProject(projectData);
      navigate("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      alert(`Failed to create project: ${error.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const stripTime = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const validateDates = () => {
    const today = stripTime(new Date());

    if (startDate) {
      const start = stripTime(new Date(startDate));
      if (start < today) {
        alert("Start date cannot be in the past.");
        setStartDate("");
        return;
      }
    }

    if (deadline) {
      const end = stripTime(new Date(deadline));
      if (end < today) {
        alert("Deadline cannot be in the past.");
        setDeadline("");
        return;
      }
    }

    if (startDate && deadline) {
      const start = stripTime(new Date(startDate));
      const end = stripTime(new Date(deadline));

      if (start > end) {
        alert("Start date cannot be after the endDate.");
        setDeadline("");
        return;
      }
    }
  };

  const dueDateValidation = () => {
    if (!dueDate) return;

    const today = stripTime(new Date());
    const due = stripTime(dueDate);

    if (due < today) {
      alert("Due date cannot be in the past.");
      setDueDate("");
      return;
    }
  };

  useEffect(() => {
    validateDates();
  }, [startDate, deadline]);

  useEffect(() => {
    dueDateValidation();
  }, [dueDate]);

  // take project start date
  const takeProjectStartDate = () => {
    return startDate ? startDate : new Date().toISOString().split("T")[0];
  };

  const takeProjectEndDate = () => {
    return deadline ? deadline : new Date().toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 text-gray-900 p-6 md:pl-52 lg:pl-64">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {loading ? (
          <SkeletonHeader />
        ) : (
          <div className="flex items-center gap-4 mb-6">
            <Link to="/projects">
              <button className="bg-gray-600 hover:bg-gray-700 text-white rounded px-3 py-1 mr-2">
                ←
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Project</h1>
              <p className="text-gray-600 mt-2">Create a new project</p>
            </div>
          </div>
        )}

        {/* Project Details and Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {loading ? (
            <SkeletonProjectDetails />
          ) : (
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <h2 className="text-lg mb-4 text-gray-900 font-semibold">Project Details</h2>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
                className="w-full p-2 mb-4 bg-gray-50 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={3}
                className="w-full p-2 mb-4 bg-gray-50 text-gray-900 border border-gray-300 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <label className="block mb-1 text-gray-700 font-medium">Start Date</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                ref={startDateRef}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onClick={handleOpenStartDate}
                className="w-full p-2 mb-4 bg-gray-50 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <label className="block mb-1 text-gray-700 font-medium">Deadline</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                ref={endDateRef}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                onClick={handleOpenDeadline}
                className="w-full p-2 mb-4 bg-gray-50 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <label className="block mb-1 text-gray-700 font-medium">Budget</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-2 bg-gray-50 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {loading ? (
            <SkeletonAddMembers />
          ) : (
           <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm ml-0 md:ml-8">
  <h2 className="text-lg mb-4 text-gray-900 font-semibold flex items-center gap-2">
    <span className="bg-blue-100 text-blue-600 p-1 rounded-full">
      👥
    </span>
    Add Members
  </h2>

  <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
    {allUsers
      ?.filter((user) => user.status === "active")
      .map((user) => {
        const isSelected = selectedMembers.some((m) => m.user === user._id);
        return (
          <div
            key={user._id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
              isSelected
                ? "bg-blue-50 border-blue-400"
                : "bg-gray-50 hover:bg-gray-100 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
  {user?.profilePic ? (
    <img
      src={user.profilePic}
      alt={user.name}
      className="w-10 h-10 rounded-full object-cover border border-gray-200"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
      {user?.name?.[0]?.toUpperCase()}
    </div>
  )}
  <div>
    <p className="font-medium text-gray-900">{user.name}</p>
    <p className="text-xs text-gray-500">{user?.globalRole?.name}</p>
  </div>
</div>

            <button
              onClick={() => handleMemberToggle(user._id)}
              className={`px-3 py-1 text-sm rounded-full transition-all ${
                isSelected
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
            >
              {isSelected ? "Remove" : "Add"}
            </button>
          </div>
        );
      })}
  </div>

  {/* Permissions Display */}
  {selectedMembers.length > 0 && (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <p className="font-bold mb-3 text-gray-900">Permissions</p>
      {selectedMembers.map((member, idx) => {
        const user = allUsers.find((u) => u._id === member.user);
        return (
          <div
            key={member.user}
            className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <p className="text-gray-900 font-semibold mb-2 flex items-center gap-2">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <span className="bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            )}
            {user?.name}{" "}
            <span className="text-sm text-gray-500">
              ({user?.globalRole?.name})
            </span>
          </p>
            <div className="flex flex-wrap gap-2">
              {["create_task", "edit_task", "delete_task", "view_tasks", "comment"].map(
                (perm) => {
                  const isChecked = member.permissions.includes(perm);
                  return (
                    <label
                      key={perm}
                      className={`cursor-pointer px-3 py-1 rounded-full text-sm border transition-all ${
                        isChecked
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isChecked}
                        onChange={() => handlePermissionChange(idx, perm)}
                      />
                      {perm.replace("_", " ")}
                    </label>
                  );
                }
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>
          )}
        </div>

        {/* Task Categories */}
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tasks</h1>
          {taskCategories.map((cat, catIndex) => (
            <div
              key={catIndex}
              className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={cat.name}
                  onChange={(e) =>
                    handleCategoryNameChange(catIndex, e.target.value)
                  }
                  className="w-full p-2 bg-gray-50 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => handleRemoveCategory(catIndex)}
                  className="ml-4 text-red-600 hover:text-red-800 font-medium"
                >
                  Remove Category
                </button>
              </div>

              {cat.tasks.map((task, taskIndex) => (
                <div
                  key={taskIndex}
                  className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200"
                >
                  <input
                    type="text"
                    placeholder="Task title"
                    value={task.title}
                    onChange={(e) =>
                      handleTaskChange(
                        catIndex,
                        taskIndex,
                        "title",
                        e.target.value
                      )
                    }
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <textarea
                    placeholder="Task description"
                    value={task.description}
                    onChange={(e) =>
                      handleTaskChange(
                        catIndex,
                        taskIndex,
                        "description",
                        e.target.value
                      )
                    }
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mb-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex gap-2 mb-2">
                    <select
                      value={task.assignedTo}
                      onChange={(e) =>
                        handleTaskChange(
                          catIndex,
                          taskIndex,
                          "assignedTo",
                          e.target.value
                        )
                      }
                      className="w-1/2 p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Assign to</option>
                      {selectedMembers
                        .filter((m) => {
                          const user = allUsers.find((u) => u._id === m.user);
                          return user.globalRole?.name !== "client";
                        })
                        .map((m) => {
                          const user = allUsers.find((u) => u._id === m.user);
                          return (
                            <option key={m.user} value={m.user}>
                              {user?.name}
                            </option>
                          );
                        })}
                    </select>
                    <select
                      value={task.priority}
                      onChange={(e) =>
                        handleTaskChange(
                          catIndex,
                          taskIndex,
                          "priority",
                          e.target.value
                        )
                      }
                      className="w-1/2 p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <input
                      type="date"
                      min={takeProjectStartDate()}
                      max={takeProjectEndDate()}
                      ref={taskDaeteRf}
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      onClick={handleTaskDate}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleRemoveTask(catIndex, taskIndex)}
                      className="ml-4 text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove Task
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => handleAddTask(catIndex)}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
              >
                + Add Task
              </button>
            </div>
          ))}
          <button
            onClick={handleAddCategory}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
          >
            + Add Category
          </button>
        </div>

        {/* Final Actions */}
        {loading ? (
          <SkeletonButtons />
        ) : (
          <div className="flex justify-end gap-4 mt-10">
            <Link to="/projects">
              <button className="bg-gray-500 hover:bg-gray-600 text-white rounded px-4 py-2 transition-colors duration-200">
                Cancel
              </button>
            </Link>
            <button
              onClick={handleCreate}
              className={`rounded px-4 py-2 transition-colors duration-200 ${
                createLoading
                  ? "bg-gray-400 hover:bg-gray-500 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {createLoading ? "Creating..." : "Create Project"}
            </button>
          </div>
        )}
      </div>
    </div>
  
);
};

export default CreateProject;