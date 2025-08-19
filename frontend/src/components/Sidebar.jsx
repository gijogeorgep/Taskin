import { Link, useLocation } from "react-router-dom";
import { useSidebarStore } from "../store/useSidebarStore";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings2,
  BarChart3,
  Settings,
} from "lucide-react";
import taskin_light from "../assets/taskin logo light.png";
import taskin_dark from "../assets/taskin logo dark.png";

function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebarStore();
  const location = useLocation();
  const activeTab = location.pathname;

  const iconProps = "w-5 h-5";

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Projects", path: "/projects", icon: FolderKanban },
    { name: "Users", path: "/users", icon: Users },
    { name: "Custom field", path: "/custom", icon: Settings2 },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* ----------------- Mobile Sidebar ----------------- */}
      {isSidebarOpen && (
        <div
          className="
            fixed top-0 left-0 z-50 
            bg-primary dark:bg-primary-dark 
            text-gray-800 dark:text-gray-200
            backdrop-blur-md w-[80%] h-auto min-h-[100vh] p-4 
            md:hidden border-r border-gray-200/50 dark:border-gray-700 shadow-2xl
          "
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/50 dark:border-gray-700">
           {/* Logo */}
<div className="flex flex-row items-center px-2 gap-3 w-48 border-b border-gray-200/50 dark:border-gray-700">
  <img
    src={taskin_light}
    alt="Taskin Logo Light"
    className="block dark:hidden w-32 h-auto" // show in light mode
  />
  <img
    src={taskin_dark}
    alt="Taskin Logo Dark"
    className="hidden dark:block w-32 h-auto" // show in dark mode
  />
</div>

            <button
              onClick={closeSidebar}
              aria-label="Close Sidebar"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-3xl p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              &times;
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  className="w-full"
                  to={item.path}
                  onClick={closeSidebar}
                >
                  <button
                    className={`flex flex-row items-center px-4 gap-3 py-3 w-full rounded-lg transition-all duration-200
                      ${
                        activeTab === item.path
                          ? "bg-blue-600 dark:bg-indigo-600 text-white shadow-lg"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-indigo-400"
                      }`}
                  >
                    <Icon className={`${iconProps}`} />
                    <span className="font-semibold text-base">{item.name}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- Desktop Sidebar ----------------- */}
      <div
        className="
          bg-primary dark:bg-primary-dark
          text-gray-800 dark:text-gray-200
          backdrop-blur-md shadow-[4px_0_20px_rgba(0,0,0,0.1)]
          md:flex hidden fixed 
          items-start gap-5 flex-col
          w-[17.7%] min-h-[100vh] h-auto top-0 z-50 
          border-r border-gray-200/50 dark:border-gray-700
        "
      >
       
<div className="flex flex-row items-center px-2 gap-3 w-56 ">
  <img
    src={taskin_light}
    alt="Taskin Logo Light"
    className="block dark:hidden w-80 h-auto" // bigger in light mode
  />
  <img
    src={taskin_dark}
    alt="Taskin Logo Dark"
    className="hidden dark:block w-80 h-auto" // bigger in dark mode
  />
</div>



        {/* Menu */}
        <div className="w-full h-full px-4 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} className="w-full" to={item.path}>
                <button
                  className={`flex flex-row items-center px-4 gap-3 py-3 w-full rounded-lg mb-1 transition-all duration-200 group
                    ${
                      activeTab === item.path
                        ? "bg-blue-600 dark:bg-indigo-600 text-white shadow-lg transform scale-[1.02]"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-indigo-400"
                    }`}
                >
                  <Icon
                    className={`${iconProps} transition-opacity duration-200 
                      ${
                        activeTab === item.path
                          ? "opacity-100"
                          : "opacity-70 group-hover:opacity-90"
                      }`}
                  />
                  <span className="font-semibold text-base">{item.name}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
