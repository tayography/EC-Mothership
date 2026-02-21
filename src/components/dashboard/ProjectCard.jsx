import React from "react";
import { motion } from "framer-motion";
import { Clock, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  planning: "bg-zinc-100 text-zinc-600",
  in_progress: "bg-violet-100 text-violet-700",
  review: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  on_hold: "bg-rose-100 text-rose-700",
};

const priorityDots = {
  low: "bg-zinc-300",
  medium: "bg-amber-400",
  high: "bg-orange-500",
  critical: "bg-rose-500",
};

export default function ProjectCard({ project, index = 0, onClick }) {
  const statusLabel = (project.status || "planning").replace(/_/g, " ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      onClick={onClick}
      className="bg-white border border-zinc-200/60 rounded-2xl p-5 hover:shadow-lg hover:shadow-zinc-900/5 hover:border-zinc-300/60 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${statusColors[project.status] || statusColors.planning}`}>
          {statusLabel}
        </div>
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-sm font-semibold text-zinc-900 mb-1 group-hover:text-violet-600 transition-colors">{project.name}</h3>
      <p className="text-xs text-zinc-400 line-clamp-2 mb-4">{project.description || "No description"}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-zinc-400">Progress</span>
          <span className="text-xs font-medium text-zinc-600">{project.progress || 0}%</span>
        </div>
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress || 0}%` }}
            transition={{ delay: index * 0.06 + 0.3, duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <div className={`w-1.5 h-1.5 rounded-full ${priorityDots[project.priority] || priorityDots.medium}`} />
          <span className="capitalize">{project.priority || "medium"}</span>
        </div>
        {project.due_date && (
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Clock className="w-3 h-3" />
            {format(new Date(project.due_date), "MMM d")}
          </div>
        )}
      </div>
    </motion.div>
  );
}