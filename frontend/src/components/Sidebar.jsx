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
import  taskinLogo from "../assets/taskin logo.png";
function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebarStore();
  const location = useLocation();
  const activeTab = location.pathname;

  // Icon size & style can be consistent here
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
      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 z-50 bg-white/95 backdrop-blur-md w-[80%] h-auto min-h-[100vh] p-4 text-gray-800 md:hidden border-r border-gray-200/50 shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/50">
            <div className="flex flex-row items-center px-2 gap-3  w-38 border-b border-gray-200/50">
         <img src={taskinLogo} alt="" />
        </div>
            <button
              onClick={closeSidebar}
              className="text-gray-600 hover:text-gray-800 text-3xl p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              &times;
            </button>
          </div>
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
                    className={`flex flex-row items-center px-4 gap-3 py-3 w-full rounded-lg transition-all duration-200 ${
                      activeTab === item.path
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <Icon className={`${iconProps} opacity-80`} />
                    <span className="font-semibold text-base">{item.name}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className="bg-white/90 backdrop-blur-md shadow-[4px_0_20px_rgba(0,0,0,0.1)] md:flex hidden fixed 
                    items-start gap-5 flex-col text-gray-800 
                    w-[17.70%] min-h-[100vh] h-auto top-0 z-50 border-r border-gray-200/50"
      >
        <div className="flex flex-row items-center px-2 gap-3  w-48 border-b border-gray-200/50">
         <img src={taskinLogo} alt="" />
        </div>

        <div className="w-full h-full px-4 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} className="w-full" to={item.path}>
                <button
                  className={`flex flex-row items-center px-4 gap-3 py-3 w-full rounded-lg mb-1 transition-all duration-200 group ${
                    activeTab === item.path
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md"
                  }`}
                >
                  <Icon
                    className={`${iconProps} transition-opacity duration-200 ${
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
