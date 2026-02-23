import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Users, Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Dashboard", icon: Home, page: "Dashboard" },
  { name: "Leads", icon: Users, page: "Leads" },
  { name: "Time", icon: Clock, page: "TimeTracking" },
  { name: "Settings", icon: Settings, page: "Settings" },
];

export default function TabBar({ currentPage }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-safe pointer-events-none">
      <div className="pointer-events-auto">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.page;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              to={createPageUrl(tab.page)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors select-none",
                isActive 
                  ? "text-cyan-600 dark:text-cyan-400" 
                  : "text-zinc-400 dark:text-zinc-500 active:text-zinc-600 dark:active:text-zinc-300"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
      </div>
    </div>
  );
}