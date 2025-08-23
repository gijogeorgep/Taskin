import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useRoleStore } from "../store/useRoleStore.js";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CreateUser = () => {
  const { getRoles } = useRoleStore();
  const { addUser } = useAuthStore();

  const [rolesList, setRolesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    roleName: "",
  });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await getRoles();
        setRolesList(roles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, [getRoles]);

  const handleChange = (e) => {
    setData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!data.name.trim()) newErrors.name = "Name is required";
    else if (data.name.length < 3)
      newErrors.name = "Name must be at least 3 characters";

    if (!data.email.trim()) newErrors.email = "Email is required";

    if (!data.password) newErrors.password = "Password is required";
    else if (data.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!data.roleName) newErrors.roleName = "Please select a role";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await addUser(data);
      setData({ name: "", email: "", password: "", roleName: "" });
      navigate("/users");
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-[#252526] dark:via-[#2c2d31] dark:to-[#3a3b40]0 min-h-screen">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 p-6">
          Create User
        </h1>
        <div className="flex flex-col w-full justify-center items-center py-8">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md w-full max-w-xs sm:max-w-md md:max-w-lg space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex lg:flex-col md:flex-row justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-800 min-h-screen lg:pl-[20%]">
      <div className="flex items-start p-4">
        <Link to="/users">
          <ArrowLeft className="text-gray-600 dark:text-gray-300 hidden sm:block" />
        </Link>
      </div>

      <div className="flex flex-col w-[90%] justify-center items-center py-8">
        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-lg shadow-md w-full max-w-xs sm:max-w-md md:max-w-lg border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-semibold mb-4">Create User</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            {/* Name */}
            <label htmlFor="name" className="font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter Name"
              className={`border-2 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              onChange={handleChange}
              value={data.name}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

            {/* Email */}
            <label htmlFor="email" className="font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter Email"
              className={`border-2 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              onChange={handleChange}
              value={data.email}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            {/* Password */}
            <label htmlFor="password" className="font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter Password"
              className={`border-2 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              onChange={handleChange}
              value={data.password}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            {/* Role */}
            <label htmlFor="roleName" className="font-medium">
              Role
            </label>
            <select
              id="roleName"
              name="roleName"
              className={`border-2 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 ${
                errors.roleName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              value={data.roleName}
              onChange={handleChange}
            >
              <option value="">Select a Role</option>
              {rolesList.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.roleName && <p className="text-red-500 text-sm">{errors.roleName}</p>}

            {/* Submit */}
            <button
              type="submit"
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
