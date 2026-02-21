import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Rocket,
  LogOut,
  Bell,
  Search,
  User,
  Clock,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Leads", icon: FolderKanban, page: "Leads" },
  { name: "Time Tracking", icon: Clock, page: "TimeTracking" },
  { name: "Analytics", icon: BarChart3, page: "Analytics" },
  { name: "Settings", icon: Settings, page: "Settings" },
];

export default function Sidebar({ currentPage }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="text-lg font-semibold tracking-tight text-zinc-900 leading-tight">
                Endless Creative
              </span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">
                mothership
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.name}
              to={createPageUrl(item.page)}
              onClick={() => setMobileOpen(false)}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/10"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                }
              `}
            >
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-600"}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-6 space-y-1">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white shadow-lg border border-zinc-200/60 flex items-center justify-center"
      >
        <LayoutDashboard className="w-4 h-4 text-zinc-600" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-3 top-3 bottom-3 z-50 w-64 bg-white/80 backdrop-blur-xl border border-zinc-200/60 rounded-2xl shadow-2xl overflow-hidden"
          >
            <NavContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="hidden lg:block fixed left-3 top-3 bottom-3 z-30 bg-white/80 backdrop-blur-xl border border-zinc-200/60 rounded-2xl shadow-xl shadow-zinc-900/5 overflow-hidden"
      >
        <NavContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-6 -right-0 w-6 h-6 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          style={{ transform: "translateX(50%)" }}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-zinc-500" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-zinc-500" />
          )}
        </button>
      </motion.aside>
    </>
  );
}