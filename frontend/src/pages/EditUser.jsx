import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useRoleStore } from "../store/useRoleStore";
import { ArrowLeft } from "lucide-react";

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    roleName: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);

  const { getUserById, editUser } = useAuthStore();
  const { roles, getRoles } = useRoleStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const user = await getUserById(userId);
      if (user) {
        setUserData({
          name: user.name,
          roleName: user.globalRole?.name || "",
          status: user.status || "active",
        });
      }
      await getRoles();
      setLoading(false);
    };

    fetchData();
  }, [userId, getUserById, getRoles]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { name, roleName, status } = userData;
    console.log("Submitting update:", { name, roleName, status });

    if (!name || !roleName) {
      import("react-hot-toast").then(({ toast }) =>
        toast.error("Name and Role are required")
      );
      return;
    }

    const result = await editUser(userId, { name, roleName, status });
    if (result) navigate("/users");
  };

  const SkeletonInput = () => (
    <div className="animate-pulse w-full h-10 bg-gray-700 rounded-md mb-4" />
  );

  const SkeletonSelect = () => (
    <div className="animate-pulse w-full h-10 bg-gray-700 rounded-md mb-8" />
  );

  const SkeletonButton = () => (
    <div className="animate-pulse w-full h-12 bg-blue-800 rounded-md" />
  );

  return (
    <div className="bg-gray-900 min-h-screen w-full flex   flex-col gap-16 pt-10 px-4 lg:pl-[20%] ">
      <div className="flex  items-start  ">
        {" "}
        <Link to="/users">
          <ArrowLeft className="text-white hidden  sm:block" />
        </Link>{" "}
      </div>

      <div className="flex items-center  w-full justify-center">
        {" "}
        <div className="w-full max-w-xl bg-[#0a0e16] rounded-2xl p-8  shadow-2xl text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {loading ? (
              <div className="animate-pulse h-8 bg-gray-700 rounded w-1/2 mx-auto" />
            ) : (
              "Edit User"
            )}
          </h2>

          {/* Name Field */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            {loading ? (
              <SkeletonInput />
            ) : (
              <input
                id="name"
                name="name"
                type="text"
                value={userData.name}
                onChange={handleChange}
                placeholder="Enter user name"
                className="w-full border border-gray-700 rounded-md px-4 py-2 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <div>
            <label className="block mb-2 font-medium">Status</label>
            <select
              name="status"
              value={userData.status}
              onChange={handleChange}
              className="w-full border border-gray-700 rounded-md px-4 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Role Selector */}
          <div className="mb-8">
            <label
              htmlFor="roleName"
              className="block text-sm font-medium mb-2"
            >
              Role
            </label>
            {loading ? (
              <SkeletonSelect />
            ) : (
              <select
                id="roleName"
                name="roleName"
                value={userData.roleName}
                onChange={handleChange}
                className="w-full border border-gray-700 rounded-md px-4 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select a role
                </option>
                {roles?.map((role) => (
                  <option key={role._id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Submit Button */}
          {loading ? (
            <SkeletonButton />
          ) : (
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white font-semibold py-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditUser;
