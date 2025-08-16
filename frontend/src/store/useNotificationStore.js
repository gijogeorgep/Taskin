import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
export const useNotificationStore = create((set, get) => ({
  preferences: null,
  fetchPreferences: async () => {
    try {
      const userId = useAuthStore.getState().authUser?._id;
      if (!userId) throw new Error("User not authenticated");

      const res = await axiosInstance.get(`/auth/getUserById/${userId}`);

      set({
        preferences: res.data.user.notificationPreferences,
      });
    } catch (error) {
      toast.error("Failed to fetch Notification preferences");
      console.error(error);
    }
  },

  updatePreference: async (key, value) => {
    try {
      let updated = { ...get().preferences, [key]: value };

      if (key === "emailNotifications" && value === false) {
        updated = {
          emailNotifications: false,
          taskAssignments: false,
          projectUpdates: false,
          weeklyReports: false,
        };
      }

      set({ preferences: updated });
      await axiosInstance.put("/auth/notification-preferences", updated);
      toast.success("Preferences updated");
    } catch (error) {
      toast.error("Failed to update preference");
      console.error(error);
    }
  },
}));
