import { useState, useEffect } from "react";
import ProjectCard from "../components/ProjectCards";
import { useProjectStore } from "../store/useProjectStore.js";
import { Link } from "react-router-dom";
import { Filter, Plus, Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";

const SkeletonCard = () => (
  <div className="animate-pulse bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-sm dark:bg-gray-800/80 dark:border-gray-700">
    <div className="h-6 bg-gray-200 rounded w-3/5 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
    <div className="h-18 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export default function Projects() {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const projectsPerPage = 6;

  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    budget: { start: "", end: "" },
  });

  const { fetchProjects, isLoading, projects } = useProjectStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Get only user-accessible projects
  const userProjects =
    authUser?.role === "admin" ||
    authUser?.role === "manager" ||
    authUser?.role === "Super Admin"||
    authUser?.role === "Demo User"
      ? projects
      : projects?.filter((project) =>
          project?.members?.some((member) => member.user === authUser?._id)
        );

  // **Filtering logic (local)**
  const filteredProjects = userProjects?.filter((p) => {
    const matchesSearch = searchText
      ? p.title?.toLowerCase().includes(searchText.toLowerCase())
      : true;

    const matchesStatus = filters.status ? p.status === filters.status : true;

    const matchesBudget =
      (filters.budget.start
        ? Number(p.Budget) >= Number(filters.budget.start)
        : true) &&
      (filters.budget.end
        ? Number(p.Budget) <= Number(filters.budget.end)
        : true);

    const matchesStartDate = filters.startDate
      ? new Date(p.startDate) >= new Date(filters.startDate)
      : true;

    const matchesEndDate = filters.endDate
      ? new Date(p.endDate) <= new Date(filters.endDate)
      : true;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesBudget &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  const sortedProjects = filteredProjects?.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = sortedProjects?.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(sortedProjects?.length / projectsPerPage);

  // Filter change handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "budgetStart" || name === "budgetEnd") {
      setFilters((prev) => ({
        ...prev,
        budget: {
          ...prev.budget,
          [name === "budgetStart" ? "start" : "end"]: value,
        },
      }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      budget: { start: "", end: "" },
    });
    setSearchText("");
  };

  if (isLoading) {
    return (
      <section className="px-4 py-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen pl-[20%] dark:dark:from-[#252526] dark:via-[#2c2d31] dark:to-[#3a3b40]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 w-full min-h-screen md:pl-[20%] dark:dark:from-[#252526] dark:via-[#2c2d31] dark:to-[#3a3b40]

">
      <div className="flex flex-col gap-6 sm:items-start md:justify-between">
        {/* Header */}
        <div className="w-full flex flex-col md:flex-row gap-4 sm:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text dark:from-blue-300 dark:text-white">
              Projects
            </h1>
            <p className="text-md text-gray-600 mt-1">
              Manage and track all your projects
            </p>
          </div>
         <Link
  to="/createproject"
  className="
    flex items-center gap-2 px-6 py-3 rounded-lg 
    bg-gradient-to-r from-blue-500 to-indigo-600 
    text-white hover:from-blue-600 hover:to-indigo-700 
    dark:from-[#252526] dark:to-gray-700 
    dark:hover:from-gray-700 dark:hover:to-gray-600
    text-sm font-medium 
    transition-all duration-200 shadow-lg hover:shadow-xl 
    transform hover:-translate-y-0.5
  "
>
  <Plus size={16} /> New Project
</Link>

        </div>

        {/* Search and Filter */}
<div className="w-full flex flex-col sm:flex-row items-center gap-6">
  {/* Search Input */}
  <div className="w-full sm:max-w-md relative">
    <Search className="text-gray-400 dark:text-gray-500 h-5 w-5 absolute top-3 left-3" />
    <input
      type="text"
      placeholder="Search projects..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 
                 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
                 text-gray-700 dark:text-gray-200 
                 placeholder-gray-400 dark:placeholder-gray-500 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
    />
  </div>

  {/* Filter Button */}
  <button
    onClick={() => setShowFilter((prev) => !prev)}
    className="flex items-center gap-2 px-6 py-3 rounded-lg 
               bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
               text-gray-700 dark:text-gray-200 
               border border-gray-200 dark:border-gray-700 
               hover:bg-white dark:hover:bg-gray-700 
               hover:shadow-md text-sm font-medium 
               transition-all duration-200"
  >
    <Filter size={16} /> {showFilter ? "Hide Filters" : "Filter"}
  </button>
</div>


        {showFilter && (
          <form className="flex flex-col md:flex-row md:flex-wrap gap-4 p-6 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-3 border border-gray-200 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="planned">Planned</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
              <option value="due">Due</option>
            </select>
            <input
              type="number"
              placeholder="Min. Budget"
              name="budgetStart"
              min={100}
              value={filters.budget.start}
              onChange={handleFilterChange}
              className="p-3 border border-gray-200 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Max. Budget"
              name="budgetEnd"
              min={100}
              value={filters.budget.end}
              onChange={handleFilterChange}
              className="p-3 border border-gray-200 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
            <input
              type="date"
              name="startDate"
              onFocus={(e) => e.target.showPicker && e.target.showPicker()}
              value={filters.startDate}
              onChange={handleFilterChange}
              className="p-3 border border-gray-200 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              name="endDate"
              onFocus={(e) => e.target.showPicker && e.target.showPicker()}
              value={filters.endDate}
              onChange={handleFilterChange}
              className="p-3 border border-gray-200 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Reset Filters
              </button>
            </div>
          </form>
        )}

        {/* Projects */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProjects?.length > 0 ? (
            currentProjects.map((item) => (
              <ProjectCard key={item?._id} project={item} user={authUser} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No projects found</div>
              <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-3 w-full">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === i + 1
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg   dark:hover:from-gray-700 dark:hover:to-gray-600"
                    : "bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-white hover:shadow-md   dark:hover:from-gray-700 dark:hover:to-gray-600"

                    
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}