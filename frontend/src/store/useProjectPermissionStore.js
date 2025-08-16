import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useProjectPermissionStore = create((set) => ({
  projectPermissions: [],
  isProjectPermissionLoading: false,
  error: null,

  createProjectPermission: async (permissionData) => {
    set({ isProjectPermissionLoading: true });
    try {
      const res = await axiosInstance.post(
        "/projectPermission/permissions",
        permissionData
      );
      toast.success("Permission created");
      return res.data.newPermission;
    } catch (error) {
      console.error("Error creating permission:", error);
      toast.error("Failed to create permission");
      set({ error: error.message });
    } finally {
      set({ isProjectPermissionLoading: false });
    }
  },

  fetchProjectPermissions: async (projectID) => {
    set({ isProjectPermissionLoading: true });
    try {
      const res = await axiosInstance.get(
        `/projectPermission/permissions/${projectID}`
      );
      set({ projectPermissions: res.data });
      console.log(res.data, "permisssssssssssssssss");

      return res.data;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      set({ error: error.message });
    } finally {
      set({ isProjectPermissionLoading: false });
    }
  },

  updateProjectPermission: async (permissionID, permissions) => {
    set({ isProjectPermissionLoading: true });
    try {
      const res = await axiosInstance.put(
        `/projectPermission/permissions/${permissionID}`,
        {
          permissions,
        }
      );
      toast.success("Permission updated");

      set((state) => ({
        projectPermissions: state.projectPermissions.map((perm) =>
          perm._id === permissionID ? res.data.updatedPermission : perm
        ),
      }));

      return res.data.updatedPermission;
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Failed to update permission");
      set({ error: error.message });
    } finally {
      set({ isProjectPermissionLoading: false });
    }
  },

  deleteProjectPermission: async (permissionID) => {
    set({ isProjectPermissionLoading: true });
    try {
      await axiosInstance.delete(
        `/projectPermission/permissions/${permissionID}`
      );
      toast.success("Permission deleted");

      // Optional: update local state
      set((state) => ({
        projectPermissions: state.projectPermissions.filter(
          (perm) => perm._id !== permissionID
        ),
      }));
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error("Failed to delete permission");
      set({ error: error.message });
    } finally {
      set({ isProjectPermissionLoading: false });
    }
  },
}));
