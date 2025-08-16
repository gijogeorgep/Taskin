import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isAddUser: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  allUsers: [],
  userFullDetailsReport: null,

  addUser: async (addData) => {
    set({ isAddUser: true });
    try {
      console.log("Sending addData:", addData);
      await axiosInstance.post("/auth/addUser", addData);
      toast.success("User Added Successfully!");
    } catch (error) {
      console.error("Error from AddUser:", error);
      toast.error("Error from AddUser");
    } finally {
      set({ isAddUser: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      console.log("Login response user data:", res.data);

      toast.success("Login successful!");
    } catch (error) {
      console.error("Error during login:", error);
      if (
        error.response?.status === 403 &&
        error.response?.data?.message === "Account is inactive"
      ) {
        toast.error("Account is inactive. Please contact the admin.");
      } else {
        toast.error(error.response?.data?.message || "Login failed!");
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/checkAuth");
      set({ authUser: res.data });
      console.log("User is authenticated", res.data);
    } catch (error) {
      console.error("Error during checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logout successful!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  },

  deleteUser: async (userId) => {
    try {
      await axiosInstance.delete(`/auth/deleteUser/${userId}`);
      toast.success("User Deleted Successfully!");
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error("Error deleting user");
    }
  },

  getAllUsers: async () => {
    try {
      const res = await axiosInstance.get("/auth/getAllUsers");
      const filteredUsers = res.data.filter(
        (user) => user.globalRole?.name !== "Super Admin"
      );
      set({ allUsers: filteredUsers });
    } catch (error) {
      console.error("Fetch all users error:", error);
      toast.error("Error fetching users");
    }
  },

  editUser: async (userId, editData) => {
    try {
      const res = await axiosInstance.put(`/auth/editUser/${userId}`, editData);
      toast.success("User Edited Successfully!");
      return res.data;
    } catch (error) {
      console.error("Edit user error:", error);
      toast.error("Error editing user");
    }
  },

  getUserById: async (userId) => {
    try {
      const res = await axiosInstance.get(`/auth/getUserById/${userId}`);
      console.log(res.data, "get user by id");

      return res.data.user;
    } catch (error) {
      console.error("Get user by ID error:", error);
      toast.error("Error fetching user by ID");
    }
  },

  autoLoginWithToken: async (token) => {
    set({ isLoggingIn: true });
    try {
      await axiosInstance.post(
        "/auth/invite-login",
        { token },
        { withCredentials: true }
      );
      const res = await axiosInstance.get("/auth/checkAuth");
      set({ authUser: res.data });

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      console.error("Auto login error:", error);
      toast.error(
        error.response?.data?.message || "This Link has been expired."
      );
      return { success: false };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await axiosInstance.put("/auth/profile", profileData);
      set({ authUser: res.data });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Error updating profile");
    }
  },

  updatepassword: async (currentPassword, newPassword) => {
    try {
      await axiosInstance.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update password."
      );
      throw error; 
    }
  },

  fetchAuthUser: async () => {
    try {
      const res = await axiosInstance.get("/auth/checkAuth");
      set({ authUser: res.data });
      console.log("Auth user refreshed:", res.data);
    } catch (error) {
      console.error("Failed to fetch auth user", error);
      toast.error("Failed to refresh user data");
    }
  },


}));
