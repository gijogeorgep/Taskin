import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../store/useTaskStore";
import { useAuthStore } from "../store/useAuthStore";

function RecentTasks() {
  const { getAllTasks, tasks } = useTaskStore();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    getAllTasks();
  }, []);

  const isAdmin =
    authUser?.role === "admin" ||
    authUser?.role === "manager" ||
    authUser?.role === "Super Admin" ||
    authUser?.role === "Demo User" || 
    authUser?.isAdmin === true;
    

  const getPriorityStyle = (priority = "") => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const toTitleCase = (str) =>
    str?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  const visibleTasks = isAdmin
    ? tasks
    : tasks?.filter((task) => {
        const assignedId =
          typeof task.assignedTo === "string"
            ? task.assignedTo
            : task.assignedTo?._id;
        return String(assignedId) === String(authUser?._id);
      });

  const handleTaskClick = (task) => {
    if (task?.project?._id) {
      navigate(`/projects/${task.project._id}`);
    } else {
      alert("This task is not associated with a valid project.");
    }
  };

  // Pagination logic
  const startIndex = page * itemsPerPage;
  const currentTasks = [...visibleTasks].reverse().slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white/90 dark:bg-[#2b2b2b] backdrop-blur-md w-full rounded-xl 
                    border border-gray-200 dark:border-gray-700 p-5 shadow-lg">
      <h1 className="font-bold text-2xl text-gray-800 dark:text-gray-100 pb-5">Recent Tasks</h1>

      {currentTasks && currentTasks.length > 0 ? (
        <>
          {currentTasks.map((task) => (
            <div
              key={task._id}
              className="bg-gray-50/70 dark:bg-gray-800 hover:bg-blue-50/70 dark:hover:bg-gray-700 
                         w-full rounded-lg p-3.5 flex items-center justify-between mb-2 cursor-pointer 
                         transition-all border border-gray-100 dark:border-gray-700"
              onClick={() => handleTaskClick(task)}
            >
              <div className="text-sm flex flex-col gap-1 text-gray-800 dark:text-gray-100">
                <p className="font-medium">{toTitleCase(task.title)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {toTitleCase(task.project?.title) ?? "Unnamed Project"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs rounded-full px-2 py-0.5 ${getPriorityStyle(
                    task.priority
                  )}`}
                >
                  {task.priority ?? "None"}
                </span>
                <h3 className="text-sm text-gray-500 dark:text-gray-400">
                  {typeof task.assignedTo === "object"
                    ? toTitleCase(task.assignedTo?.name)
                    : "Unknown"}
                </h3>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 
                         text-gray-800 dark:text-gray-200 rounded disabled:opacity-50"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page + 1} of {Math.ceil(visibleTasks.length / itemsPerPage)}
            </span>
            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(p + 1, Math.ceil(visibleTasks.length / itemsPerPage) - 1)
                )
              }
              disabled={startIndex + itemsPerPage >= visibleTasks.length}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 
                         text-gray-800 dark:text-gray-200 rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          {isAdmin ? "No tasks found." : "No tasks assigned to you."}
        </p>
      )}
    </div>
  );
}

export default RecentTasks;
