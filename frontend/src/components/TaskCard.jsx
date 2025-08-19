import { useEffect, useState } from "react";
import AddTask from "./AddTask";
import { useTaskStore } from "../store/useTaskStore.js";
import TaskFullDetails from "./TaskFullDetails";
import TaskUpdate from "./TaskUpdate";
import { Plus, Trash, Pencil } from "lucide-react";
import commenticon from "../assets/comment.png";
import TaskComment from "./TaskComment";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { useCategoryStore } from "../store/useCategoryStore.js";
import { useProjectStore } from "../store/useProjectStore.js";

function TaskCard({ isOpen, setTaskOpen, projectId, refreshProject }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isUpdateOpen, setUpdateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [taskDetails, setTaskdetails] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const { tasks, updateTask, deleteTask } = useTaskStore();
  const { categories, fetchCategories, deleteCategory, updateCategory } =
    useCategoryStore();
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const { authUser } = useAuthStore();
  const { updateProjectStatus } = useProjectStore();

  const { geTaskWithField } = useTaskStore();
  const toggleDropdown = (taskId) => {
    setActiveDropdown((prev) => (prev === taskId ? null : taskId));
  };

  const getRoleName = () => {
    return authUser?.role?.toLowerCase?.() || "";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 w-18 text-center rounded-full";
      case "inprogress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 w-18 text-center rounded-full";
      case "todo":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 w-18 text-center rounded-full";
      case "blocked":
        return "bg-red-900 text-red-800 dark:bg-red-900/20 dark:text-red-300 w-18 text-center rounded-full";
      case "due":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 w-18 text-center rounded-full";
    }
  };

  const toTitleCase = (str) =>
    str?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  const hasPermission = (...permissions) => {
    return permissions.some((perm) => authUser?.permissions?.includes(perm));
  };

  const hasEditPermission = (task) => {
    const roleName = getRoleName();
    const assignedToId = task.assignedTo?._id || task.assignedTo;

    const canEdit =
      ["admin", "super admin", "manager"].includes(roleName) ||
      authUser?._id === assignedToId;

    if (!canEdit) {
      // toast.error("Permission denied.");
      return false;
    }

    return true;
  };

  const handleEdit = (task) => {
    if (!hasEditPermission(task)) return;

    setSelectedTask(task);
    setUpdateOpen(true);
    setActiveDropdown(null);
  };
  const handleRenameCategory = async (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    if (!category) return;

    const newName = (newCategoryName || "").trim().toLowerCase();
    const oldName = (category?.name || "").trim().toLowerCase();

    if (!newName) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (oldName === "default tasks") {
      toast.error("You cannot rename the Default Tasks category");
      return;
    }

    if (newName === "default tasks") {
      toast.error("You cannot rename a category to 'Default Tasks'");
      return;
    }

    const duplicate = categories.some(
      (cat) =>
        cat._id !== categoryId && cat.name.trim().toLowerCase() === newName
    );
    if (duplicate) {
      toast.error("A category with this name already exists");
      return;
    }

    if (newName === oldName) {
      toast.error("Category name is the same as before");
      return;
    }

    await updateCategory(categoryId, { name: newCategoryName });
    setEditingCategoryId(null);
    setNewCategoryName("");
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmed) return;

    await deleteCategory(categoryId);
  };

  const handleDelete = async (task) => {
    if (!hasEditPermission(task)) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmed) return;
    await deleteTask(task._id);
    setActiveDropdown(null);
  };

  const taskMap = categories.reduce((acc, cat) => {
    const catId = cat._id;
    const catName = cat.name;
    const tasksInCategory = tasks.filter((task) => task.category === catId);
    acc[catName] = tasksInCategory;
    return acc;
  }, {});

  const allCategoryNames = Object.keys(taskMap).sort((a, b) => {
    if (a === "Default Tasks") return 1;
    if (b === "Default Tasks") return -1;
    return a.localeCompare(b);
  });

  const openDetails = () => setTaskdetails(true);
  const closeDetails = () => setTaskdetails(false);

  useEffect(() => {
    const updateData = async () => {
      try {
        await fetchCategories(projectId);
        await updateProjectStatus(projectId);
      } catch (err) {
        console.error("Failed to update project status:", err);
        toast.error("Failed to update project status");
      }
    };

    updateData();
  }, [projectId, fetchCategories]);

  return (
   <div className="text-gray-900 px-4 transition-all">
  <div className="flex justify-between items-center mb-6">
    <AddTask
      isOpen={isOpen}
      onClose={() => setTaskOpen(false)}
      selectedCategory={selectedCategory}
    />
  </div>

  {taskDetails && selectedTask && !isUpdateOpen ? (
    <TaskFullDetails task={selectedTask} closeDetails={closeDetails} />
  ) : (
    <div className="space-y-8 overflow-y-auto transition-all pr-1">
      {allCategoryNames.map((catName) => (
        <div
          key={catName}
          className="border border-gray-300 bg-white rounded-xl p-6 max-h-[520px] overflow-y-auto shadow-sm dark:bg-gray-800 dark:border-gray-700"
        >
          {/* Category Header */}
          <div className="flex justify-between items-center mb-4">
            {editingCategoryId ===
            categories.find((cat) => cat.name === catName)?._id ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameCategory(editingCategoryId);
                    } else if (e.key === "Escape") {
                      setEditingCategoryId(null);
                      setNewCategoryName("");
                    }
                  }}
                  className="bg-gray-100 text-gray-900 rounded px-2 py-1 border border-gray-300"
                  autoFocus
                />
                <button
                  onClick={() => handleRenameCategory(editingCategoryId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingCategoryId(null)}
                  className="border bg-white border-gray-300 hover:bg-gray-100 px-4 py-1 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {catName}
                </h2>
                {catName !== "Default Tasks" && hasPermission("create_task") && (
                  <button
                    onClick={() => {
                      const targetCategory = categories.find(
                        (cat) => cat.name === catName
                      );
                      setEditingCategoryId(targetCategory._id);
                      setNewCategoryName(targetCategory.name);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Pencil size="18" />
                  </button>
                )}
              </div>
            )}

            {hasPermission("create_task") && (
              <button
                onClick={() => {
                  setTaskOpen(true);
                  const targetCategory = categories.find(
                    (cat) => cat.name === catName
                  );
                  if (targetCategory) setSelectedCategory(targetCategory._id);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-all px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="size-4" />
                <span className="text-sm">Add Task</span>
              </button>
            )}
          </div>

          {/* Task List */}
          <div className="space-y-4">
            {taskMap[catName]?.length > 0 ? (
              taskMap[catName].map((task) => {
                const isChecked = task.status === "done";
                return (
                  <div
                    key={task._id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-400 transition-all"
                  >
                    <div
                      onClick={async (e) => {
                        e.stopPropagation();
                        openDetails();
                        setSelectedTask(task);
                        await geTaskWithField(task._id);
                      }}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex-1">
                        <p
                          className={`font-semibold text-lg ${
                            isChecked
                              ? "line-through text-gray-400"
                              : "text-gray-900"
                          }`}
                        >
                          {toTitleCase(task.title)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {toTitleCase(task.assignedTo?.name) || "Not assigned"}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-500">
                              Priority
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                task.priority === "high"
                                  ? "text-red-700 bg-red-100"
                                  : task.priority === "medium"
                                  ? "text-yellow-700 bg-yellow-100"
                                  : "text-green-700 bg-green-100"
                              }`}
                            >
                              {task.priority.charAt(0).toUpperCase() +
                                task.priority.slice(1)}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-500">
                              Status
                            </span>
                            {editingStatus === task._id ||
                            hasEditPermission(task) ? (
                              <select
                                value={task.status}
                                onClick={(e) => e.stopPropagation()}
                                onChange={async (e) => {
                                  await updateTask(task._id, {
                                    title: task.title,
                                    description: task.description,
                                    assignedTo:
                                      task.assignedTo?._id ||
                                      task.assignedTo,
                                    status: e.target.value,
                                    priority: task.priority,
                                    category: task.category,
                                    dueDate:
                                      task.dueDate ||
                                      new Date().toISOString().split("T")[0],
                                    project:
                                      task.project?._id || task.project,
                                  });
                                  await updateProjectStatus(projectId);
                                  if (typeof refreshProject === "function") {
                                    await refreshProject();
                                  }
                                  setEditingStatus(null);
                                }}
                                onBlur={() => setEditingStatus(null)}
                                className="bg-white border border-gray-300 text-gray-900 text-xs rounded px-2 py-1"
                              >
                                <option value="todo">To Do</option>
                                <option value="inprogress">In Progress</option>
                                <option value="done">Done</option>
                                <option value="blocked">Blocked</option>
                                {task.status === "due" && (
                                  <option value="due">Due</option>
                                )}
                              </select>
                            ) : (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!hasEditPermission(task)) return;
                                  setEditingStatus(task._id);
                                }}
                                className={getStatusColor(task.status)}
                              >
                                {task.status.charAt(0).toUpperCase() +
                                  task.status.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-4"
                      >
                        <img
                          className="w-5 h-5 cursor-pointer"
                          src={commenticon}
                          alt="comment"
                          onClick={() => {
                            setSelectedComment(task._id);
                          }}
                        />
                        {hasPermission(
                          "edit_task",
                          "delete_task",
                          "create_task"
                        ) && (
                          <div className="relative">
                            <div
                              className="text-gray-500 cursor-pointer hover:bg-gray-200 rounded p-2"
                              onClick={() => toggleDropdown(task._id)}
                            >
                              ⋮
                            </div>
                            {activeDropdown === task._id && (
                              <div className="absolute right-1 top-7 mt-2 z-50 w-24 bg-white border border-gray-300 rounded-lg shadow-md">
                                {hasPermission(
                                  "edit_task",
                                  "create_task"
                                ) && (
                                  <button
                                    onClick={() => handleEdit(task)}
                                    className="w-full px-5 py-1 text-left text-sm hover:bg-gray-100"
                                  >
                                    Edit
                                  </button>
                                )}
                                {hasPermission(
                                  "delete_task",
                                  "create_task"
                                ) && (
                                  <button
                                    onClick={() => handleDelete(task)}
                                    className="w-full px-5 py-1 text-left text-sm hover:bg-gray-100 text-red-600"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comments */}
                    {selectedComment === task._id && selectedTask && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <TaskComment
                          task={selectedTask}
                          onClose={(e) => {
                            e.stopPropagation();
                            setSelectedComment(null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">
                No tasks in this category.
              </p>
            )}
          </div>

          {/* Delete Category */}
          {hasPermission("delete_task") && (
            <button
              onClick={() => {
                const targetCategory = categories.find(
                  (cat) => cat.name === catName
                );
                if (targetCategory)
                  handleDeleteCategory(targetCategory._id);
              }}
              className="w-full mt-3 bg-white text-red-600 py-2 rounded-md border border-gray-300 hover:bg-red-50 flex items-center justify-center gap-2"
            >
              <Trash className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  )}

  <TaskUpdate
    isOpen={isUpdateOpen}
    onClose={() => {
      setUpdateOpen(false);
      setSelectedTask(null);
    }}
    task={selectedTask}
  />
</div>

  );
}

export default TaskCard;
