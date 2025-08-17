import {create} from 'zustand';



export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem("theme") || "light", 

  setTheme: (newTheme) => {
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    set({ theme: newTheme });
  },

  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    get().setTheme(newTheme);
  },

  isDarkMode: () => get().theme === "dark",
}));

