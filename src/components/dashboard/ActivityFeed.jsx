import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Zap, FolderPlus, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";

const typeConfig = {
  project_update: { icon: Zap, color: "bg-violet-100 text-violet-600" },
  team_change: { icon: FolderPlus, color: "bg-sky-100 text-sky-600" },
  milestone: { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
  comment: { icon: MessageSquare, color: "bg-amber-100 text-amber-600" },
  system: { icon: AlertCircle, color: "bg-zinc-100 text-zinc-500" },
};

export default function ActivityFeed({ activities = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-zinc-100" />
            <div className="flex-1">
              <div className="h-3.5 bg-zinc-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-zinc-50 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400 text-sm">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, i) => {
        const config = typeConfig[activity.type] || typeConfig.system;
        const Icon = config.icon;
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors group cursor-default"
          >
            <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-700 font-medium truncate">{activity.title}</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {activity.created_date ? format(new Date(activity.created_date), "MMM d, h:mm a") : "Just now"}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}