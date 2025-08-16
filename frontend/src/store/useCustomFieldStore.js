import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
// import { useTaskStore } from "./useTaskStore";

export const useCustomField = create((set) => ({
  customFields: [],
  loading: false,
  error: null,

  createField: async (data) => {
    try {
      const res = await axiosInstance.post("/custom-field/create", data);

      set((state) => ({
        customFields: [res.data.newField, ...state.customFields],
        error: null,
      }));

      toast.success("Custom field created successfully");
      // if (data.appliesTo === "tasks" && data.target) {
      //   const { getTaskByProject } = useTaskStore.getState();
      //   await getTaskByProject(data.project);
      // }
    } catch (error) {
      console.error("Create error:", error);
      set({ error: error.message });
    }
  },

  fetchFields: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/custom-field/getAllFields");
      set({ customFields: res.data.customFields });
    } catch (error) {
      console.error("Fetch error:", error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateField: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/custom-field/${id}`, data);

      set((state) => ({
        customFields: state.customFields.map((field) =>
          field._id === id ? res.data.updateField : field
        ),
      }));
      toast.success("Custom field updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      set({ error: error.message });
    }
  },

  deleteField: async (id) => {
    try {
      await axiosInstance.delete(`/custom-field/${id}`);

      set((state) => ({
        customFields: state.customFields.filter((field) => field._id !== id),
      }));
      toast.success("Custom field deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      set({ error: error.message });
    }
  },
}));
