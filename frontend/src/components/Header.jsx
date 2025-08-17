import sidebarIcon from "../assets/ui.png";
import { useAuthStore } from "../store/useAuthStore";
import { useSidebarStore } from "../store/useSidebarStore";
import { useNavigate, Link } from "react-router-dom";
import InitialsAvatar from "react-initials-avatar";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

function Header() {
  const { logout, authUser } = useAuthStore();
  const { openSidebar } = useSidebarStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    try {
      const confirmLogout = window.confirm("Are you sure you want to logout?");
      if (!confirmLogout) return;
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  return (
    <div
      className="
        bg-white/90 dark:bg-[#252526]/95 
        backdrop-blur-md 
        border-b border-gray-200/50 dark:border-gray-700/60 
        shadow-sm 
        text-gray-800 dark:text-gray-100
        w-full md:w-[82.3%] md:ml-[17.70%] 
        py-3 px-6
        flex justify-between items-center
        transition-colors duration-300
      "
    >
      {/* Left section */}
      <div className="flex flex-row gap-3 items-center">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="
            p-2 rounded-full 
            bg-gray-200 dark:bg-gray-700 
            text-black dark:text-white 
            hover:scale-110 transition
          "
        >
          {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Profile */}
        <Link to="/settings">
          {authUser?.profilePic ? (
            <img
              src={authUser.profilePic}
              alt="Profile"
              className="
                rounded-full w-12 h-12 object-cover 
                border-2 border-blue-200 dark:border-gray-600 
                hover:border-blue-400 dark:hover:border-gray-400 
                transition-colors
              "
            />
          ) : (
            <InitialsAvatar
              name={authUser?.name || "User"}
              className="
                rounded-full 
                bg-gradient-to-r from-blue-500 to-indigo-600 
                text-white 
                w-10 h-10 flex items-center justify-center 
                border-2 border-blue-200 dark:border-gray-600 
                hover:border-blue-400 dark:hover:border-gray-400
                transition-colors
              "
            />
          )}
        </Link>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Logout */}
        <img
          onClick={handleLogout}
          width="25"
          height="25"
          src="https://img.icons8.com/ios-filled/666666/50/logout-rounded-up.png"
          alt="logout"
          className="
            cursor-pointer 
            opacity-80 hover:opacity-100 
            transition-opacity
            dark:invert
          "
        />

        {/* Sidebar toggle (mobile) */}
        <div onClick={openSidebar} className="md:hidden cursor-pointer">
          <img
            src={sidebarIcon}
            alt="Toggle Sidebar"
            className="opacity-70 hover:opacity-100 transition-opacity dark:invert"
          />
        </div>
      </div>
    </div>
  );
}

export default Header;
