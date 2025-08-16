// store/useCategoryStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/taskCategories/getAllCategories`, {
        withCredentials: true,
        params: { projectId },
      });
      set({ categories: res.data.categories, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch categories",
        loading: false,
      });
    }
  },

  createCategory: async (categoryData, projectId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/taskCategories/createCategory", categoryData, {
        withCredentials: true,
      });
      await get().fetchCategories(projectId); // this alone is enough
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to create category",
        loading: false,
      });
    }
  },

  addTaskToCategory: async (categoryId, taskData) => {
    set({ loading: true, error: null });
    try {
      const url = categoryId
        ? `/taskCategories/addTaskToCategory/${categoryId}/tasks`
        : `/taskCategories/addTaskToCategory/null/tasks`;

      const res = await axiosInstance.post(url, taskData, {
        withCredentials: true,
      });

      const updatedCategory = res.data.updatedCategory;

      set((state) => ({
        categories: state.categories.map((cat) =>
          cat._id === updatedCategory._id ? updatedCategory : cat
        ),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add task to category",
        loading: false,
      });
    }
  },

  updateCategory: async (categoryId, updatedData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.put(
        `/taskCategories/updateCategory/${categoryId}`,
        updatedData,
        { withCredentials: true }
      );

      const updatedCategory = res.data.category;
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat._id === categoryId ? updatedCategory : cat
        ),
        loading: false,
      }));
      return updatedCategory;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update category",
        loading: false,
      });
      throw err;
    }
  },

  deleteCategory: async (categoryId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(
        `/taskCategories/deleteCategory/${categoryId}`,
        {
          withCredentials: true,
        }
      );
      set((state) => ({
        categories: state.categories.filter((cat) => cat._id !== categoryId),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to delete category",
        loading: false,
      });
    }
  },
}));
