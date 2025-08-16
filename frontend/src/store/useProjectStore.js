import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useProjectStore = create((set, get) => ({
  projects: [],
  isLoading: false,
  filteredProjects: [],
  setFilteredProjects: (projects) => set({ filteredProjects: projects }),

  addProject: async (projectData) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post(
        "/project/createProject",
        projectData
      );
      console.log(res.data, "Project created successfully!");
      set((state) => ({
        projects: [...(state.projects || []), res.data.newProject],
      }));
      // await get().updateProjectStatus(res.data);
      await get().fetchProjects();

      console.log("Project data after creation:", res.data);

      toast.success("Project created successfully!");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/project/getAllProjects");
      console.log(res.data.projects, "Projects fetched successfully!");
      set({ projects: res.data.projects });
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    } finally {
      set({ isLoading: false });
    }
  },

  editProject: async (id, projectData) => {
    set({ isLoading: true });
    console.log(projectData, "Project data to be updated");

    try {
      const res = await axiosInstance.put(
        `/project/updateProject/${id}`,
        projectData
      );

      set((state) => ({
        projects: state.projects.map((project) =>
          project._id === id ? res.data.project : project
        ),
      }));

      toast.success("Project updated successfully!");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true });
    try {
      await axiosInstance.delete(`/project/deleteProject/${id}`);
      set((state) => ({
        projects: state.projects.filter((project) => project._id !== id),
      }));
      toast.success("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      set({ isLoading: false });
    }
  },

  getProjectById: async (id) => {
    try {
      const res = await axiosInstance.get(`/project/getProjectById/${id}`);
      console.log("Project fetched by ID:", res.data.project);

      return res.data.project;
    } catch (error) {
      console.error("Error fetching project by ID:", error);
      toast.error("Failed to load project");
      return null;
    }
  },


  userProjects: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/project/getUserProjects/${userId}`);
      set({ userProjects: res.data.projects });
      // toast.success("User projects fetched successfully!");
    } catch (error) {
      console.error("Error fetching user projects:", error);
      toast.error("Failed to fetch user projects");
    } finally {
      set({ isLoading: false });
    }
  },

  projectTaskStatusSummary: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(
        "/project/getProjectTaskStatusSummary"
      );
      // console.log("Project task status summaries:", res.data);
      set({ taskStatusSummaries: res.data });
      // toast.success("Project task status summaries fetched successfully!");
      return res.data;
    } catch (error) {
      console.error("Error fetching project task status summaries:", error);
      toast.error("Failed to fetch project task status summaries");
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  updateProjectStatus: async (projectId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(
        `/project/status/update/${projectId}`
      );
      const updatedProject = res.data.project;
      const refreshProject = await get().getProjectById(projectId);
      // console.log("Updated project response:", updatedProject);
      // console.log("Refresh project response:", refreshProject);

      set((state) => ({
        projects: state.projects.map((proj) =>
          proj._id === projectId ? refreshProject : proj
        ),
        selectedProject:
          state.selectedProject?._id === projectId
            ? refreshProject
            : state.selectedProject,
      }));
      console.log(`Status updated to "${updatedProject.status}"`);

      // toast.success(`Status updated to "${updatedProject.status}"`);
    } catch (error) {
      console.error(
        "Project status update failed:",
        error.response?.data || error.message
      );
      toast.error("Failed to update status project store");
    } finally {
      set({ isLoading: false });
    }
  },
}));
