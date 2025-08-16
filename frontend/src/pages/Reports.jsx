import React, { useEffect, useState, useRef } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  CheckSquare,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useProjectStore } from "../store/useProjectStore";
import { useTaskStore } from "../store/useTaskStore";
import { useAuthStore } from "../store/useAuthStore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { useCategoryStore } from "../store/useCategoryStore";

const getTaskStatusDistribution = (tasks) => {
  const normalizeStatus = (status) => {
    const trimmed = status?.trim().toLowerCase();
    switch (trimmed) {
      case "done":
        return "Done";
      case "inprogress":
        return "In Progress";
      case "todo":
        return "To Do";
      case "blocked":
        return "Blocked";
      case "due":
        return "Due";
      default:
        return null; // ignore unknown status
    }
  };

  const counts = tasks.reduce((acc, task) => {
    const status = normalizeStatus(task.status || "todo");
    if (status) {
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {});

  const colors = {
    Done: "#10B981",
    "In Progress": "#3B82F6",
    "To Do": "#FACC15",
    Blocked: "#DC2626",
    Due: "#F87171",
  };

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: colors[name],
  }));
};

const toTitleCase = (str) =>
  str?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

function Reports() {
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, getAllTasks } = useTaskStore();
  const { allUsers, getAllUsers } = useAuthStore();
  const { fetchCategories, categories } = useCategoryStore();
  const [dateRange, setDateRange] = useState("30");
  const { projectTaskStatusSummary } = useProjectStore();
  const [reportType, setReportType] = useState("overview");
  const [projectTaskStatus, setProjectTaskStatus] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedProjectStatus, setSelectedProjectStatus] = useState("");
  const [selectedUserStatus, setSelectedUserStatus] = useState("");

  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  const getCutoffDate = (days) => {
    const parsedDays = parseInt(days);
    if (isNaN(parsedDays)) return new Date("2000-01-01"); // Fallback date
    const date = new Date();
    date.setDate(date.getDate() - parsedDays);
    return date;
  };

  const cutoffDate = getCutoffDate(dateRange || "30");
  console.log("Cutoff Date:", cutoffDate);

  useEffect(() => {
    fetchProjects();
    getAllUsers();
    getAllTasks();
    fetchCategories(selectedProjectId || undefined);
  }, [fetchProjects, getAllUsers, getAllTasks, selectedProjectId]);

  useEffect(() => {
    const fetchSummary = async () => {
      const rawSummary = await projectTaskStatusSummary();
      const transformed = rawSummary.map((item) => ({
        name: item.projectTitle,
        startDate: item.projectStartDate,
        toDo: item.todo || 0,
        inProgress: item.inProgress || 0,
        done: item.done || 0,
        due: item.projectDue || 0,
        cancelled: item.cancelled || 0,
        blocked: item.blocked || 0,
      }));
      setProjectTaskStatus(transformed);
    };
    fetchSummary();
  }, [projectTaskStatusSummary]);

  const selectedUser = allUsers.find((user) => user._id === selectedUserId);

  const filteredTasks =
    reportType === "tasks" && selectedProjectId && selectedCategoryId
      ? tasks.filter(
          (task) =>
            task.project?._id === selectedProjectId &&
            task.category?._id === selectedCategoryId &&
            new Date(task.createdAt) >= cutoffDate
        )
      : reportType === "tasks" && selectedProjectId
      ? tasks.filter(
          (task) =>
            task.project?._id === selectedProjectId &&
            new Date(task.createdAt) >= cutoffDate
        )
      : reportType === "projects" && selectedProjectId
      ? tasks.filter(
          (task) =>
            task.project?._id === selectedProjectId &&
            new Date(task.createdAt) >= cutoffDate
        )
      : tasks.filter((task) => new Date(task.createdAt) >= cutoffDate);

  const filteredUserTasks =
    reportType === "users" && selectedUserId
      ? tasks.filter(
          (task) =>
            task.assignedTo?._id === selectedUserId &&
            new Date(task.createdAt) >= cutoffDate
        )
      : [];

  const getUserRoleDistribution = (users) => {
    const counts = users.reduce((acc, user) => {
      const role = user.globalRole?.name || "Unknown";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const colors = [
      "#10B981", // green
      "#3B82F6", // blue
      "#F59E0B", // amber
      "#EF4444", // red
      "#8B5CF6", // violet
    ];

    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  };

  const roleData = getUserRoleDistribution(allUsers);

  const recentTasks = filteredTasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((task) => ({
      id: task._id,
      title: toTitleCase(task.title) || "Untitled Task",
      project: toTitleCase(task.project?.title) || "Unknown Project",
      assignee: toTitleCase(task.assignedTo?.name) || "Unassigned",
      status: toTitleCase(task.status) || "To Do",
      category: toTitleCase(task.category?.name) || "Uncategorized",
      completedDate:
        task.status === "done" && task.updatedAt
          ? new Date(task.updatedAt).toLocaleDateString()
          : "-",
    }));

  const statusData =
    reportType === "users" && selectedUserId
      ? getTaskStatusDistribution(filteredUserTasks)
      : getTaskStatusDistribution(filteredTasks);

  const now = new Date();

  const filteredProjectTaskStatus =
    reportType === "projects" || reportType === "overview"
      ? projectTaskStatus.filter((p) => {
          const matchedProject = projects.find((proj) => proj.title === p.name);
          if (!matchedProject) return false;

          const projectStart = new Date(matchedProject.createdAt);
          if (projectStart < cutoffDate || projectStart > now) return false;

          if (selectedProjectId && matchedProject._id !== selectedProjectId)
            return false;
          if (
            selectedProjectStatus &&
            matchedProject.status?.toLowerCase() !==
              selectedProjectStatus.toLowerCase()
          )
            return false;

          return true;
        })
      : projectTaskStatus;

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const downloadCSV = () => {
    const selectedUser = allUsers.find((user) => user._id === selectedUserId); // ✅ FIX added

    let fileName = "report.csv";
    let reportTitle = "Report";

    if (reportType === "overview") {
      reportTitle = "Overall Report";
      fileName = "overall_report.csv";
    } else if (reportType === "projects") {
      if (selectedProjectId) {
        const selectedProject = projects.find(
          (p) => p._id === selectedProjectId
        );
        reportTitle = `Project Report: ${
          selectedProject?.title || "Selected Project"
        }`;
        fileName = `project_${(selectedProject?.title || "project")
          .replace(/\s+/g, "_")
          .toLowerCase()}_report.csv`;
      } else {
        reportTitle = "Project Report";
        fileName = "project_report.csv";
      }
    } else if (reportType === "tasks") {
      if (selectedProjectId && selectedCategoryId) {
        const proj = projects.find((p) => p._id === selectedProjectId);
        const cat = categories.find((c) => c._id === selectedCategoryId);
        reportTitle = `Task Report: ${proj?.title || "Project"} - ${
          cat?.name || "Category"
        }`;
        fileName = `task_${(proj?.title || "project")
          .replace(/\s+/g, "_")
          .toLowerCase()}_${(cat?.name || "category")
          .replace(/\s+/g, "_")
          .toLowerCase()}_report.csv`;
      } else if (selectedProjectId) {
        const proj = projects.find((p) => p._id === selectedProjectId);
        reportTitle = `Task Report: ${proj?.title || "Project"}`;
        fileName = `task_${(proj?.title || "project")
          .replace(/\s+/g, "_")
          .toLowerCase()}_report.csv`;
      } else {
        reportTitle = "Task Report";
        fileName = "task_report.csv";
      }
    } else if (reportType === "users" && selectedUser) {
      reportTitle = `${selectedUser.name}'s Task Report`;
      fileName = `user_${selectedUser.name
        .replace(/\s+/g, "_")
        .toLowerCase()}_report.csv`;
    }

    let headers = [];
    let rows = [];

    if (reportType === "projects" && !selectedProjectId) {
      headers = [
        "Project",
        "Total Tasks",
        "Categories",
        "Due Date",
        "Status",
        "Team Members",
      ];
      rows = projectSummaries.map((proj) => [
        proj.title || "N/A",
        proj.taskCount || 0,
        proj.categoryCount || 0,
        proj.dueDate || "N/A",
        proj.status || "N/A",
        proj.teamMembers || 0,
      ]);
    } else {
      headers = [
        "Task",
        "Project",
        "Category",
        "Assignee",
        "Status",
        "Completed Date",
      ];

      const filtered =
        reportType === "users" && selectedUser
          ? recentTasks.filter((task) => task.assignee === selectedUser.name)
          : recentTasks;

      rows = filtered.map((task) => [
        task.title || "N/A",
        task.project || "N/A",
        task.category || "N/A",
        task.assignee || "N/A",
        task.status || "N/A",
        task.completedDate || "N/A",
      ]);
    }

    const csvTitle = `${reportTitle}\n\n`;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(
        csvTitle + [headers, ...rows].map((row) => row.join(",")).join("\n")
      );

    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = async () => {
    try {
      const doc = new jsPDF();
      let y = 20;

      let reportTitle = "User Report";
      let fileName = "User_report.pdf";

      if (reportType === "overview") {
        reportTitle = "Overall Report";
        fileName = "overall_report.pdf";
      } else if (reportType === "projects") {
        if (selectedProjectId) {
          const selectedProject = projects.find(
            (p) => p._id === selectedProjectId
          );
          reportTitle = `Project Report: ${
            selectedProject?.title || "Selected Project"
          }`;
          fileName = `project_${(selectedProject?.title || "project")
            .replace(/\s+/g, "_")
            .toLowerCase()}_report.pdf`;
        } else {
          reportTitle = "Project Report";
          fileName = "project_report.pdf";
        }
      } else if (reportType === "tasks") {
        if (selectedProjectId && selectedCategoryId) {
          const proj = projects.find((p) => p._id === selectedProjectId);
          const cat = categories.find((c) => c._id === selectedCategoryId);
          reportTitle = `Task Report: ${proj?.title || "Project"} - ${
            cat?.name || "Category"
          }`;
          fileName = `task_${(proj?.title || "project")
            .replace(/\s+/g, "_")
            .toLowerCase()}_${(cat?.name || "category")
            .replace(/\s+/g, "_")
            .toLowerCase()}_report.pdf`;
        } else if (selectedProjectId) {
          const proj = projects.find((p) => p._id === selectedProjectId);
          reportTitle = `Task Report: ${proj?.title || "Project"}`;
          fileName = `task_${toTitleCase(proj?.title || "project")
            .replace(/\s+/g, "_")
            .toLowerCase()}_report.pdf`;
        } else {
          reportTitle = "Task Report";
          fileName = "task_report.pdf";
        }
      } else if (reportType === "users" && selectedUser) {
        reportTitle = `${toTitleCase(selectedUser.name)}'s Task Report`;
        fileName = `user_${selectedUser.name
          .replace(/\s+/g, "_")
          .toLowerCase()}_report.pdf`;
      }

      doc.text(reportTitle, 14, y);
      y += 10;

      if (
        (reportType === "projects" || reportType === "tasks") &&
        selectedProjectId &&
        selectedProject
      ) {
        doc.setFontSize(10);
        doc.text(`Project Name: ${selectedProject.title}`, 14, y);
        y += 6;
        doc.text(
          `Start Date: ${new Date(
            selectedProject.createdAt
          ).toLocaleDateString()}`,
          14,
          y
        );
        y += 6;
        doc.text(
          `Deadline: ${
            selectedProject.endDate
              ? new Date(selectedProject.endDate).toLocaleDateString()
              : "N/A"
          }`,
          14,
          y
        );
        y += 6;
        doc.text(`Status: ${selectedProject.status || "Unknown"}`, 14, y);
        y += 10;
      }

      // Pie Chart
      if (pieChartRef.current) {
        const pieCanvas = await html2canvas(pieChartRef.current);
        const pieImgData = pieCanvas.toDataURL("image/png");
        doc.addImage(pieImgData, "PNG", 14, y, 180, 80);
        y += 90;
      }

      // Bar Chart
      if (
        barChartRef.current &&
        (reportType === "overview" || reportType === "projects")
      ) {
        const barCanvas = await html2canvas(barChartRef.current);
        const barImgData = barCanvas.toDataURL("image/png");
        doc.addImage(barImgData, "PNG", 14, y, 180, 80);
        y += 90;
      }

      // Table Logic
      if (reportType === "projects" && !selectedProjectId) {
        doc.text("All Projects Overview", 14, y);
        y += 10;
        autoTable(doc, {
          head: [
            [
              "Project",
              "Total Tasks",
              "Categories",
              "Due Date",
              "Status",
              "Team Members",
            ],
          ],
          body: projectSummaries.map((proj) => [
           toTitleCase( proj.title )|| "N/A",
         proj.taskCount || 0,
         proj.categoryCount || 0,
           toTitleCase( proj.dueDate) || "N/A",
           toTitleCase( proj.status )|| "N/A",
            proj.teamMembers || 0,
          ]),
          startY: y,
          styles: { fontSize: 8 },
          theme: "striped",
        });
      } else {
        if (reportType === "users" && !selectedUserId) {
          // Filter based on selectedUserStatus
          const filteredUsers =
            selectedUserStatus === "active"
              ? allUsers.filter((user) => user.status === "active")
              : selectedUserStatus === "inactive"
              ? allUsers.filter((user) => user.status === "inactive")
              : allUsers;

          const title =
            selectedUserStatus === "active"
              ? "Active Users Overview"
              : selectedUserStatus === "inactive"
              ? "Inactive Users Overview"
              : "All Users Overview";

          doc.text(title, 14, y);
          y += 10;

          autoTable(doc, {
            head: [["Name", "Email", "Role"]],
            body: filteredUsers.map((user) => [
              toTitleCase(user.name) || "N/A",
              toTitleCase(user.email) || "N/A",
              toTitleCase(user.globalRole?.name )|| "Unknown",
            ]),
            startY: y,
            styles: { fontSize: 8 },
            theme: "striped",
          });
        } else {
         const filteredTasks =
  reportType === "users" && selectedUser
    ? filteredUserTasks.map((task) => ({
        title: toTitleCase(task.title) || "Untitled Task",
        project: toTitleCase(task.project?.title) || "Unknown Project",
        category: toTitleCase(task.category?.name) || "Uncategorized",
        assignee: toTitleCase(task.assignedTo?.name) || "Unassigned",
        status: toTitleCase(task.status) || "To Do",
        completedDate:
          task.status === "done" && task.updatedAt
            ? new Date(task.updatedAt).toLocaleDateString()
            : "-",
      }))
    : recentTasks;


          autoTable(doc, {
            head: [
              [
                "Task",
                "Project",
                "Category",
                "Assignee",
                "Status",
                "Completed Date",
              ],
            ],
            body: filteredTasks.map((task) => [
              task.title || "N/A",
              task.project || "N/A",
              task.category || "N/A",
              task.assignee || "N/A",
              task.status || "N/A",
              task.completedDate || "N/A",
            ]),
            startY: y,
            styles: { fontSize: 8 },
            theme: "striped",
          });
        }
      }

      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      Done: "bg-green-100 text-green-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "To Do": "bg-gray-100 text-gray-800",
      Blocked: "bg-red-100 text-red-800",
      Due: "bg-yellow-100 text-yellow-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  const projectSummaries = projects
    .filter((project) =>
      selectedProjectStatus ? project.status === selectedProjectStatus : true
    )
    .map((project) => {
      const projectTasks = tasks.filter(
        (task) => task.project?._id === project._id
      );

      const categoriesSet = new Set(
        projectTasks.map((task) => task.category?._id).filter(Boolean)
      );

      return {
        id: project._id,
        title: project.title,
        taskCount: projectTasks.length,
        categoryCount: categoriesSet.size,
        dueDate: project.endDate
          ? new Date(project.endDate).toLocaleDateString()
          : "N/A",
        status: project.status || "Unknown",
        teamMembers: project.members.length,
      };
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50  text-black p-4 space-y-6 md:pl-4 lg:pl-[19%]">
      <h1 className="font-bold uppercase text-sm sm:text-base">Reports</h1>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Track progress and performance across projects
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
            onClick={downloadPDF}
          >
            <FileText className="h-4 w-4" /> Export PDF
          </button>
          <button
            className="bg-gray-700 text-white hover:bg-gray-800 px-4 py-2 rounded flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
            onClick={downloadCSV}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4">
        <select
          className="bg-gray-100 text-black px-4 py-2 rounded text-xs sm:text-sm w-full sm:w-[180px]"
          value={reportType}
          onChange={(e) => {
            setReportType(e.target.value);
            setSelectedProjectId("");
            setSelectedCategoryId("");
            setSelectedUserId("");
          }}
        >
          <option value="overview">Overview</option>
          <option value="projects">Projects</option>
          <option value="tasks">Tasks</option>
          <option value="users">Users</option>
        </select>
        <select
          className="bg-gray-200 text-black px-4 py-2 rounded text-xs sm:text-sm w-full sm:w-[180px]"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="" disabled>
            Date Range
          </option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
          <option value="365">Last year</option>
        </select>
        {(reportType === "projects" || reportType === "tasks") && (
          <select
            className="bg-gray-200 text-black px-4 py-2 rounded text-xs sm:text-sm w-full sm:w-[220px]"
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedCategoryId("");
            }}
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {toTitleCase(project.title)}
              </option>
            ))}
          </select>
        )}

        {reportType === "projects" && (
          <select
            className="bg-gray-200 text-black px-4 py-2 rounded text-xs sm:text-sm w-full sm:w-[180px]"
            value={selectedProjectStatus}
            onChange={(e) => setSelectedProjectStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="due">Due</option>
            <option value="on hold">On Hold</option>
          </select>
        )}

        {reportType === "tasks" && selectedProjectId && (
          <select
            className="bg-gray-200 text-black px-4 py-2 rounded text-xs sm:text-sm w-full sm:w-[220px]"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {toTitleCase(category.name)}
              </option>
            ))}
          </select>
        )}
        {reportType === "users" && (
          <>
            {/* User Status Filter */}
            <select
              className="bg-[#020817] text-white px-4 py-2 rounded text-xs sm:text-sm w-full sm:w-[160px]"
              value={selectedUserStatus}
              onChange={(e) => setSelectedUserStatus(e.target.value)}
            >
              <option value="">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* User Selector */}
            <select
              className="bg-gray-200 text-black px-4 py-2 rounded text-xs sm:text-sm w-full sm:w-[220px]"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select User</option>
              {allUsers
                .filter((user) => {
                  if (selectedUserStatus === "active")
                    return user.status === "active";
                  if (selectedUserStatus === "inactive")
                    return user.status === "inactive";
                  return true;
                })

                .map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
            </select>
          </>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(reportType === "overview" ||
          (reportType === "projects" && !selectedProjectId)) && (
          <div className="w-full bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-xs sm:text-sm font-medium text-gray-800">
                Total Projects
              </h2>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-black">
              {projects.length}
            </div>
            <p className="text-xs text-gray-600">+2 from last month</p>
          </div>
        )}

        {reportType === "users" && selectedUserId && (
          <div className="w-full bg-white rounded-xl p-4 shadow-md ">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-xs sm:text-sm font-medium text-gray-900">
                Total Projects
              </h2>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {
                new Set(
                  filteredUserTasks
                    .map((task) => task.project?._id)
                    .filter(Boolean)
                ).size
              }
            </div>
            <p className="text-xs text-gray-500">Projects with user's tasks</p>
          </div>
        )}
        <div className="w-full bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xs sm:text-sm font-medium text-gray-900">
              Total Tasks
            </h2>
            <CheckSquare className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {reportType === "projects" && selectedProjectId
              ? filteredTasks.length
              : reportType === "users" && selectedUserId
              ? filteredUserTasks.length
              : reportType === "tasks" && selectedProjectId
              ? filteredTasks.length
              : tasks.length}
          </div>
          <p className="text-xs text-gray-500">
            {reportType === "projects" && selectedProjectId
              ? `${
                  filteredTasks.filter((t) => t.status === "done").length
                } completed`
              : reportType === "users" && selectedUserId
              ? `${
                  filteredUserTasks.filter((t) => t.status === "done").length
                } completed`
              : reportType === "tasks" && selectedProjectId
              ? `${
                  filteredTasks.filter((t) => t.status === "done").length
                } completed`
              : `${
                  tasks.filter((t) => t.status?.trim().toLowerCase() === "done")
                    .length
                } completed`}
          </p>
        </div>
        <div className="w-full bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xs sm:text-sm font-medium text-gray-900">
              Team Members
            </h2>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {(reportType === "projects" && selectedProjectId) ||
            (reportType === "tasks" && selectedProjectId)
              ? new Set(
                  filteredTasks
                    .map((task) => task.assignedTo?._id)
                    .filter(Boolean)
                ).size
              : allUsers.filter(
                  (user) => user.status?.toLowerCase() === "active"
                ).length}
          </div>
          <p className="text-xs text-gray-500">
            {(reportType === "projects" && selectedProjectId) ||
            (reportType === "tasks" && selectedProjectId)
              ? "Project team members"
              : "Active users"}
          </p>
        </div>
      </div>

      {/* Charts */}
    {reportType !== "projects" && (
  <div className="grid grid-cols-1 gap-6">
    <div
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
      ref={pieChartRef}
    >
      <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
        {reportType === "users"
          ? selectedUserId
            ? "Task Status Distribution"
            : "User Role Distribution"
          : "Task Status Distribution"}
      </h2>

      <ResponsiveContainer width="100%" height={250} minHeight={200}>
        <PieChart>
          <Pie
            data={
              reportType === "users"
                ? selectedUserId
                  ? statusData // user's task status
                  : roleData // all users' roles
                : statusData
            }
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="80%"
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {(reportType === "users"
              ? selectedUserId
                ? statusData
                : roleData
              : statusData
            ).map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {reportType === "users" && !selectedUserId && (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
          All Users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-600 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {allUsers
                .filter((user) => {
                  if (selectedUserStatus === "active")
                    return user.status === "active";
                  if (selectedUserStatus === "inactive")
                    return user.status === "inactive";
                  return true;
                })
                .map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 text-gray-800 font-medium">
                      {toTitleCase(user.name)}
                    </td>
                    <td className="px-4 py-2 text-gray-500">{user.email}</td>
                    <td className="px-4 py-2 text-gray-500">
                      {toTitleCase(user.globalRole?.name) || "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {toTitleCase(user.status)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
)}

      {projectTaskStatus.length > 0 &&
        (reportType === "overview" || reportType === "projects") && (
          <div
            className="bg-white p-4 rounded-xl shadow-md"
            ref={barChartRef}
          >
            <h2 className="text-base sm:text-lg font-semibold mb-4">
              Project Progress
            </h2>
            <div style={{ position: "relative", height: "440px" }}>
              <ResponsiveContainer width="100%" height={400} minHeight={300}>
                <BarChart
                  data={filteredProjectTaskStatus}
                 margin={{ top: 20, right: 20, left: 0, bottom: 80 }}

                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    stroke="#ccc"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    tickFormatter={(value) =>
                      toTitleCase(
                        value.length > 10 ? value.slice(0, 10) + "…" : value
                      )
                    }
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="#ccc" tick={{ fontSize: 12 }} />

                  <Tooltip />

                  <Legend
                    layout="horizontal"
                    align="center"
                    wrapperStyle={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      margin: "auto",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  />

                  <Bar
                    dataKey="done"
                    stackId="a"
                    fill="#10B981"
                    name="Done"
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="inProgress"
                    stackId="a"
                    fill="#3B82F6"
                    name="In Progress"
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="toDo"
                    stackId="a"
                    fill="#FACC15"
                    name="To Do"
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="blocked"
                    stackId="a"
                    fill="#EF4444"
                    name="Blocked"
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="due"
                    stackId="a"
                    fill="#F87171"
                    name="Due"
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
{reportType === "users" && selectedUserId && (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
      User Report
    </h2>
    <div className="space-y-2 text-xs sm:text-sm text-gray-700">
      <p>
        <strong className="text-gray-500">Name:</strong> {selectedUser?.name}
      </p>
      <p>
        <strong className="text-gray-500">Role:</strong>{" "}
        {selectedUser?.globalRole.name}
      </p>
      <p>
        <strong className="text-gray-500">Email:</strong>{" "}
        {selectedUser?.email}
      </p>
    </div>

    <div className="mt-6">
      <h3 className="text-sm sm:text-md font-semibold mb-2 text-gray-700">
        Assigned Tasks
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-600 uppercase bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-2">Task</th>
              <th className="px-2 sm:px-4 py-2">Project</th>
              <th className="px-2 sm:px-4 py-2">Status</th>
              <th className="px-2 sm:px-4 py-2">Completed Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredUserTasks.map((task) => (
              <tr
                key={task._id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-2 sm:px-4 py-2 text-gray-800 font-medium">
                  {task.title || "Untitled Task"}
                </td>
                <td className="px-2 sm:px-4 py-2">
                  {task.project?.title || "Unknown Project"}
                </td>
                <td className="px-2 sm:px-4 py-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {toTitleCase(task.status)}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-2">
                  {task.status === "done" && task.updatedAt
                    ? new Date(task.updatedAt).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

 {reportType === "projects" && selectedProjectId && selectedProject && (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2 text-sm text-gray-700">
    <h2 className="text-base sm:text-lg font-semibold mb-2">
      Project Details
    </h2>
    <p>
      <strong className="text-gray-500">Project Name:</strong>{" "}
      {toTitleCase(selectedProject.title)}
    </p>
    <p>
      <strong className="text-gray-500">Start Date:</strong>{" "}
      {new Date(selectedProject.createdAt).toLocaleDateString()}
    </p>
    <p>
      <strong className="text-gray-500">Deadline:</strong>{" "}
      {selectedProject.endDate
        ? new Date(selectedProject.endDate).toLocaleDateString()
        : "N/A"}
    </p>
    <p>
      <strong className="text-gray-500">Status:</strong>{" "}
      <span
        className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${getStatusColor(
          selectedProject.status
        )}`}
      >
        {toTitleCase(selectedProject.status)}
      </span>
    </p>
  </div>
)}



      {/* Task Table */}
      {/* Project Summary Table */}
      {/* Show Project Summary Table when in projects tab and no specific project is selected */}
     {reportType === "projects" && !selectedProjectId ? (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
      All Projects Overview
    </h2>
    <div className="overflow-x-auto max-h-[400px]">
      <table className="w-full text-xs sm:text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-600 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-2">Project</th>
            <th className="px-4 py-2">Total Tasks</th>
            <th className="px-4 py-2">Task Categories</th>
            <th className="px-4 py-2">Due Date</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Team Members</th>
          </tr>
        </thead>
        <tbody>
          {projectSummaries.map((proj) => (
            <tr
              key={proj.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-2 text-gray-800 font-medium">
                {toTitleCase(proj.title)}
              </td>
              <td className="px-4 py-2">{proj.taskCount}</td>
              <td className="px-4 py-2">{proj.categoryCount}</td>
              <td className="px-4 py-2">{proj.dueDate}</td>
              <td className="px-4 py-2 capitalize">
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${getStatusColor(
                    proj.status
                  )}`}
                >
                  {proj.status}
                </span>
              </td>
              <td className="px-4 py-2">{proj.teamMembers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
) : reportType === "users" && selectedUserId ? null : (
        //  Show Recent Task Activity for other views, EXCEPT when a specific user is selected
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
  <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
    Recent Task Activity
  </h2>
  <div className="overflow-x-auto max-h-[300px]">
    <table className="w-full text-xs sm:text-sm text-left text-gray-600">
      <thead className="text-xs text-gray-600 uppercase bg-gray-50">
        <tr>
          <th className="px-2 sm:px-6 py-2 sm:py-3">Task</th>
          <th className="px-2 sm:px-6 py-2 sm:py-3">Project</th>
          <th className="px-2 sm:px-6 py-2 sm:py-3">Category</th>
          <th className="px-2 sm:px-6 py-2 sm:py-3">Assignee</th>
          <th className="px-2 sm:px-6 py-2 sm:py-3">Status</th>
          <th className="px-2 sm:px-6 py-2 sm:py-3">Completed Date</th>
        </tr>
      </thead>
      <tbody>
        {recentTasks.map((task) => (
          <tr
            key={task.id}
            className="border-b border-gray-100 hover:bg-gray-50"
          >
            <td className="px-2 sm:px-6 py-2 sm:py-4 font-medium text-gray-800">
              {task.title}
            </td>
            <td className="px-2 sm:px-6 py-2 sm:py-4">{task.project}</td>
            <td className="px-2 sm:px-6 py-2 sm:py-4">{task.category}</td>
            <td className="px-2 sm:px-6 py-2 sm:py-4">{task.assignee}</td>
            <td className="px-2 sm:px-6 py-2 sm:py-4">
              <span
                className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${getStatusColor(
                  task.status
                )}`}
              >
                {toTitleCase(task.status)}
              </span>
            </td>
            <td className="px-2 sm:px-6 py-2 sm:py-4">{task.completedDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

      )}
    </div>
  );
}

export default Reports;
