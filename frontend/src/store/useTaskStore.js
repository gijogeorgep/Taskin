import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useTaskStore = create((set) => ({
  tasks: [],
  comments: [],
  loading: false,
  error: null,

  addTask: async (taskData) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/task/addtask", taskData, {
        withCredentials: true,
      });

      const newTask = res.data.newTask;

      if (taskData.category && taskData.category !== "Default Tasks") {
        try {
          await axiosInstance.post(
            `/taskCategories/addTaskToCategory/${taskData.category}/tasks`,
            { taskId: newTask._id },
            { withCredentials: true }
          );
        } catch (error) {
          console.warn("Failed to assign task to category:", error.message);
        }
      }

      set((state) => ({
        tasks: [...state.tasks, newTask],
        loading: false,
      }));

      console.log(newTask);
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to add task",
        loading: false,
      });
    }
  },

  getTaskByProject: async (projectId) => {
    set({ loading: true, tasks: [] });
    try {
      const res = await axiosInstance.get(`/task/taskByProject/${projectId}`, {
        withCredentials: true,
      });
      console.log(res.data.tasks, "task by project successfully getting");

      set({ tasks: res.data.tasks, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deleteTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/task/deletetask/${taskId}`, {
        withCredentials: true,
      });

      set((state) => ({
        tasks: (state.tasks || []).filter((task) => task._id !== taskId),
        loading: false,
      }));

      toast.success("Task deleted successfully");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete task",
        loading: false,
      });

      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  },

  updateTask: async (taskId, taskData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.put(
        `/task/updatetask/${taskId}`,
        taskData,
        {
          withCredentials: true,
        }
      );
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === taskId ? res.data.updatedTask : task
        ),
        loading: false,
      }));
      toast.success("Task updated successfully");
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update task",
        loading: false,
      });
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  },

  addComment: async (taskId, commentData) => {
    set({ loading: true });
    try {
      await axiosInstance.post(`/task/${taskId}/comment`, commentData);
      toast.success("Comment added");
      await useTaskStore.getState().fetchComments(taskId);
    } catch (error) {
      toast.error("Failed to add comment");
      console.log(error, "error from addComment");
    } finally {
      set({ loading: false });
    }
  },

  fetchComments: async (taskId) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(`/task/getTaskById/${taskId}`, {
        withCredentials: true,
      });

      const fetchedComments = res.data?.task?.comments || [];

      // const task = res.data?.task;
      // console.log("task with fields", task);

      set({ comments: fetchedComments, loading: false });
    } catch (error) {
      toast.error("Failed to load comments");
      console.log(error, " error from fetchComments");

      set({ loading: false });
    }
  },

  updateComment: async (taskId, commentId, newText) => {
    try {
      const res = await axiosInstance.put(
        `/task/${taskId}/comment/${commentId}`,
        { text: newText },
        { withCredentials: true }
      );
      const updated = res.data?.comment;

      set((state) => ({
        comments: state.comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, text: updated.text }
            : comment
        ),
      }));

      toast.success("Comment updated");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  },

  deleteComment: async (taskId, commentId) => {
    try {
      await axiosInstance.delete(`/task/${taskId}/comment/${commentId}`, {
        withCredentials: true,
      });

      set((state) => ({
        comments: state.comments.filter((comment) => comment._id !== commentId),
      }));
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Failed to delete comment", error);
      toast.error("Failed to delete comment");
    }
  },

  getAllTasks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/task/getalltask", {
        withCredentials: true,
      });
      set({ tasks: res.data.tasks, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch tasks",
        loading: false,
      });
    }
  },

  getTaskCategory: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/taskCategories/${projectId}`);
      set({ category: res.data.tasks, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "failed to fetch categories",
        loading: false,
      });
    }
  },

  getTaskWithField: async (taskId) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/task/getTaskById/${taskId}`, {
        withCredentials: true,
      });

      const task = res.data?.task;
      console.log("Fetched task with custom fields:", task);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? task : t)),
        loading: false,
      }));
      return task;
    } catch (error) {
      console.error("Failed to fetch task by ID with field", error);
      set({ error: error.message, loading: false });
    }
  },
}));
