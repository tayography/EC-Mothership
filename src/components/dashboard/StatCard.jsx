import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, change, changeLabel, icon: Icon, color = "violet", index = 0 }) {
  const colorMap = {
    violet: { bg: "bg-violet-50", icon: "text-violet-500", ring: "ring-violet-100" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", ring: "ring-emerald-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-500", ring: "ring-amber-100" },
    sky: { bg: "bg-sky-50", icon: "text-sky-500", ring: "ring-sky-100" },
    rose: { bg: "bg-rose-50", icon: "text-rose-500", ring: "ring-rose-100" },
  };

  const c = colorMap[color] || colorMap.violet;
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-white border border-zinc-200/60 rounded-2xl p-5 hover:shadow-lg hover:shadow-zinc-900/5 hover:border-zinc-300/60 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
      <p className="text-xs text-zinc-400 mt-1">{title}</p>
    </motion.div>
  );
}