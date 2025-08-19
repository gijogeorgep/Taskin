import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Settings,
  SquarePen,
  Trash,
  UserPlus,
  Search,
  User,
  Shield,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import InitialsAvatar from "react-initials-avatar";
import { formatDistanceToNow } from "date-fns";

const Users = () => {
  const navigate = useNavigate();
  const { getAllUsers, allUsers, deleteUser, authUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const adminCount = allUsers?.filter(
    (user) => user.globalRole?.name?.toLowerCase() === "admin"
  ).length;

  const managerCount = allUsers?.filter(
    (user) => user.globalRole?.name?.toLowerCase() === "manager"
  ).length;

  const formatLastLogin = (dateString) => {
    if (!dateString) return "N/A";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        await getAllUsers();
      } catch (error) {
        toast.error("Failed to load users");
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log(allUsers, "users..");
    console.log(authUser, "auth user in users page");
    fetchUsers();
  }, [getAllUsers]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      await deleteUser(id);
      await getAllUsers();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const StatCard = ({ title, value, icon }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 p-5 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800/70 dark:border-gray-700 dark:shadow-none">
      <div className="flex flex-col">
        <span className="text-gray-600 dark:text-gray-100">{title}</span>
        <span className="font-bold text-2xl text-gray-800 dark:text-gray-200">{value}</span>
      </div>
      <div className="text-blue-500 size-4">{icon}</div>
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 p-5 animate-pulse">
      <div className="h-4 bg-gray-200 w-1/2 mb-2 rounded"></div>
      <div className="h-6 bg-gray-200 w-1/3 mb-1 rounded"></div>
      <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "px-4 py-2 bg-green-100 text-green-800 w-20 rounded-lg text-center";
      case "inactive":
        return "px-4 py-2 bg-blue-100 text-blue-800 w-20 text-center rounded-lg";
      default:
        return "px-4 py-2 bg-gray-100 text-gray-800 w-20 text-center rounded-lg";
    }
  };

  const filteredUsers = allUsers?.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  const activeUsersCount = allUsers?.filter(
    (user) => user.status === "active"
  ).length;

  const toTitleCase = (str) =>
    str?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 text-gray-800 py-10 md:pl-[19%] px-4 dark:from-[#252526] dark:via-[#2c2d31] dark:to-[#3a3b40]">
      {/* Sidebar */}

      {/* Main Content */}
      <main className="flex-1">
        <div className="flex justify-between flex-col md:flex-row">
          <span className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:text-white">Users</h1>
            <p className="text-lg text-gray-600">
              Manage your team and user permissions
            </p>
          </span>
          <div className="flex flex-col md:flex-row justify-end gap-4 mb-6">
            <Link
              to="/createrole"
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md border text-gray-700 rounded-lg flex items-center gap-2 px-4 h-10 transition-all"
            >
              <Settings className="size-4" />
              <button>Manage Roles</button>
            </Link>
            <Link
              to="/createuser"
              className="border border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 text-sm font-medium transition-all shadow-lg hover:shadow-xl rounded-lg flex items-center gap-2 px-4 h-10"
            >
              <UserPlus className="size-4" />
              <button>Create User</button>
            </Link>
          </div>
        </div>
        <div className="w-full sm:max-w-md mb-6 relative">
          <Search className="text-gray-400 h-5 w-5 absolute top-3 left-3" />
          <input
            type="text"
            placeholder="Search Users..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-400    dark:bg-[#2b2b2b] dark:backdrop-blur-md dark:text-gray-300 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                title="Total Users"
                value={allUsers?.length}
                icon={<User />}
              />
              <StatCard
                title="Active Users"
                value={activeUsersCount}
                icon={<User />}
              />
              <StatCard title="Admins" value={adminCount} icon={<Shield />} />
              <StatCard
                title="Managers"
                value={managerCount}
                icon={<Shield />}
              />
            </>
          )}
        </div>

       <div className="mt-8 bg-white/90 dark:bg-[#2b2b2b] backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-lg">
  <h2 className="text-2xl px-8 py-8 text-gray-800 dark:text-gray-100 font-semibold">
    Team Members
  </h2>

  <table className="min-w-full table-auto">
    <thead className="text-gray-600 dark:text-gray-300 text-left border-b border-gray-200 dark:border-gray-700">
      <tr>
        <th className="p-4 font-medium">User</th>
        <th className="p-4 font-medium">Role</th>
        <th className="p-4 font-medium">Status</th>
        <th className="text-center font-medium">Projects</th>
        <th className="text-center font-medium">Tasks</th>
        <th className="text-center font-medium">Last Login</th>
        <th className="p-4 text-center font-medium"></th>
      </tr>
    </thead>

    <tbody>
      {loading ? (
        [...Array(6)].map((_, index) => (
          <tr key={index} className="animate-pulse">
            <td className="p-4">
              <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </td>
            <td className="p-4">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </td>
            <td className="p-4">
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </td>
            <td className="p-4 text-center">
              <div className="h-5 w-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
            </td>
          </tr>
        ))
      ) : filteredUsers?.length > 0 ? (
        filteredUsers.map((user) => (
          <tr
            key={user._id}
            className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <td className="p-4 text-gray-800 dark:text-gray-200 font-medium flex items-center gap-4">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="rounded-full w-8 h-8 object-cover border-2 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <InitialsAvatar
                  name={user.name}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-8 h-8 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600"
                />
              )}

              <div>
                <p className="text-gray-800 dark:text-gray-200">{toTitleCase(user.name)}</p>
                <p className="text-gray-500 dark:text-gray-400 font-light">
                  {user.email}
                </p>
              </div>
            </td>

            <td className="p-4 text-gray-600 dark:text-gray-300">
              {toTitleCase(user.globalRole?.name) || "N/A"}
            </td>
            <td>
              <p className={getStatusColor(user?.status)}>
                {toTitleCase(user?.status) || "Unavailable"}
              </p>
            </td>
            <td className="text-center text-gray-700 dark:text-gray-300">
              {user?.projectCount || 0}
            </td>
            <td className="text-center text-gray-700 dark:text-gray-300">
              {user?.taskCount || 0}
            </td>
            <td className="text-center text-gray-600 dark:text-gray-400">
              {formatLastLogin(user?.lastLogin)}
            </td>

            {authUser?.role !== "Super Admin" ? (
              <td className="p-4 text-center">
                {authUser?.role === "admin" &&
                user?.globalRole?.name !== "admin" ? (
                  <div className="flex justify-center gap-3">
                    <SquarePen
                      onClick={() => navigate(`/edituser/${user._id}`)}
                      className="size-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    />
                    <Trash
                      onClick={() => handleDelete(user._id)}
                      className="size-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    />
                  </div>
                ) : (
                  <div></div>
                )}
              </td>
            ) : (
              <td className="p-4 text-center">
                <div className="flex justify-center gap-3">
                  <SquarePen
                    onClick={() => navigate(`/edituser/${user._id}`)}
                    className="size-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  />
                  <Trash
                    onClick={() => handleDelete(user._id)}
                    className="size-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  />
                </div>
              </td>
            )}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={7} className="p-4 text-center text-gray-600 dark:text-gray-400">
            No users found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      </main>
    </div>
  );
};

export default Users;