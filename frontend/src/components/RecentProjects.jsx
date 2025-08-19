import React, { useState, useEffect } from "react";
import Calendar from "../assets/calendar.png";
import { useProjectStore } from "../store/useProjectStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

function RecentProjects() {
  const { fetchProjects, isLoading, projects } = useProjectStore();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const itemsPerPage = 5;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      case "in progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      case "planned": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "on hold": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "due": return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      case "cancelled": return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const toTitleCase = (str) =>
    str?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  const filteredProjects =
    authUser?.role === "admin" || authUser?.role === "manager" || authUser?.role === "Super Admin"
      ? projects
      : projects?.filter((project) =>
          project.members?.some((member) => member.user === authUser?._id)
        );

  const handleProjectClick = (projectId) => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  useEffect(() => {
    if (!projects?.length) {
      fetchProjects();
    }
  }, []);

  if (isLoading) return <div className="text-gray-700 dark:text-gray-300">Loading...</div>;

  const startIndex = page * itemsPerPage;
  const currentItems = filteredProjects?.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white/90 dark:bg-[#2b2b2b] backdrop-blur-md text-gray-800 dark:text-gray-100 
                    w-full rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg">
      <h1 className="font-bold text-2xl pb-5">Recent Projects</h1>

      {currentItems?.length > 0 ? (
        <>
          {currentItems.map((item) => (
            <div
              key={item._id}
              onClick={() => handleProjectClick(item._id)}
              className="flex justify-between p-4 items-center mb-2 cursor-pointer 
                         bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 
                         rounded-lg transition-all"
            >
              <h1 className="text-base font-medium">{toTitleCase(item.title)}</h1>

              <div className="flex items-center gap-3">
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                  {item.status.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <img src={Calendar} alt="calendar" className="h-3" />
                  <span>
                    {item.endDate ? new Date(item.endDate).toLocaleDateString("en-US") : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                         rounded disabled:opacity-50"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page + 1} of {Math.ceil(filteredProjects.length / itemsPerPage)}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(p + 1, Math.ceil(filteredProjects.length / itemsPerPage) - 1))
              }
              disabled={startIndex + itemsPerPage >= filteredProjects.length}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                         rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
          No projects assigned to you
        </div>
      )}
    </div>
  );
}

export default RecentProjects;
