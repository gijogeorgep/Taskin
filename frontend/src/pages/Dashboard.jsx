import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { FolderKanban, Users, FileCheck2 } from "lucide-react";
import RecentProjects from "../components/RecentProjects";
import RecentTasks from "../components/RecentTasks";
import { useTaskStore } from "../store/useTaskStore";
import { useProjectStore } from "../store/useProjectStore";
import { useAuthStore } from "../store/useAuthStore";

function Dashboard() {
  const { tasks } = useTaskStore();
  const { projects, userProjects } = useProjectStore();
  const { getAllUsers, allUsers } = useAuthStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await getAllUsers();
      console.log(userProjects);
      setTimeout(() => setLoading(false), 100);
    };
    loadData();
  }, []);

  const countThisMonth = (items) => {
    const now = new Date();
    return (
      items?.filter((item) => {
        const created = new Date(item.createdAt);
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }).length ?? 0
    );
  };

  const StatCard = ({ title, value, icon, monthlyCount }) => (
    <div className="bg-white/80 dark:bg-[#2b2b2b] backdrop-blur-sm rounded-lg 
                    border border-gray-200 dark:border-gray-700 
                    p-5 flex justify-between items-start shadow-sm 
                    hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        <span className="text-gray-600 dark:text-gray-400">{title}</span>
        <span className="font-bold text-2xl text-gray-800 dark:text-gray-100">
          {value}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-500">
          +{monthlyCount} this month
        </span>
      </div>
      <div className="text-blue-500 dark:text-blue-400">{icon}</div>
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white/80 dark:bg-[#2b2b2b] backdrop-blur-sm rounded-lg 
                    border border-gray-200 dark:border-gray-700 
                    p-5 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/2 mb-2 rounded"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 w-1/3 mb-1 rounded"></div>
    </div>
  );

  return (
    <div
      className="flex min-h-screen 
                 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 
                 dark:from-[#252526] dark:via-[#2c2d31] dark:to-[#3a3b40]"
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:pt-[5vh] md:pl-[20%] px-4 md:px-6 pb-10">
        <h1 className="font-bold text-xl text-gray-700 dark:text-gray-100 mb-6">
          Welcome back! Here's what's happening with your projects.
        </h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-9">
          {loading ? (
            [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                title="Total Projects"
                value={projects?.length}
                icon={<FolderKanban className="w-4 h-4" />}
                monthlyCount={countThisMonth(projects)}
              />
              <StatCard
                title="Active Tasks"
                value={tasks?.length}
                monthlyCount={countThisMonth(tasks)}
                icon={<FileCheck2 className="w-4 h-4" />}
              />
              <StatCard
                title="Team Members"
                value={allUsers?.length}
                icon={<Users className="w-4 h-4" />}
                monthlyCount={countThisMonth(allUsers)}
              />
            </>
          )}
        </div>

        {/* Recent Projects and Tasks */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {loading ? (
            <>
              <div className="bg-white/80 dark:bg-[#2b2b2b] backdrop-blur-sm h-40 rounded-lg animate-pulse border border-gray-200 dark:border-gray-700" />
              <div className="bg-white/80 dark:bg-[#2b2b2b] backdrop-blur-sm h-40 rounded-lg animate-pulse border border-gray-200 dark:border-gray-700" />
            </>
          ) : (
            <>
              <RecentProjects />
              <RecentTasks />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
