import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useRoleStore = create((set) => ({
  roles: [],
  isLoading: false,
  error: null,
  success: null,

  addRole: async (name, permissions) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const response = await axiosInstance.post("/role/addRole", {
        name,
        permissions,
      });
      set((state) => ({
        roles: [...state.roles, response.data], // append to roles list
        isLoading: false,
        success: "Role added successfully",
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error adding role",
      });
      throw error;
    }
  },

  getRoles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/role/getRoles");
      const filteredRoles = response.data.filter(
        (role) => role.name !== "Super Admin"
      );
      set({ roles: filteredRoles, isLoading: false });
      return filteredRoles;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error fetching roles",
      });
      throw error;
    }
  },

  editRole: async (roleId, name, permissions) => {
    set({ isLoading: true, error: null, success: null });
    try {
      console.log("Sending to backend →", { name, permissions });

      const response = await axiosInstance.put(`/role/updateRole/${roleId}`, {
        name,
        permissions,
      });
      set((state) => ({
        roles: state.roles.map((role) =>
          role._id === roleId ? response.data : role
        ),
        isLoading: false,
        success: "Role updated successfully",
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error updating role",
      });
      throw error;
    }
  },

  deleteRole: async (roleId) => {
    set({ isLoading: true, error: null, success: null });
    try {
      await axiosInstance.delete(`/role/deleteRole/${roleId}`);
      set((state) => ({
        roles: state.roles.filter((role) => role._id !== roleId),
        isLoading: false,
        success: "Role deleted successfully",
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error deleting role",
      });
      throw error;
    }
  },
}));
