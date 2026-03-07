import React from "react";
import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#f59e0b", "#a1a1aa", "#f97316"];

export default function LeaderboardCard({ leaderboard }) {
  const top3 = leaderboard.slice(0, 3);

  const chartData = top3.map((rep, i) => ({
    name: rep.name,
    wins: rep.wins,
    fill: COLORS[i],
  }));

  const maxWins = Math.max(...leaderboard.map(r => r.wins), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="bg-white border border-zinc-200/60 rounded-2xl p-5 hover:shadow-lg hover:shadow-zinc-900/5 transition-all duration-300 flex flex-col"
    >
      <h3 className="text-sm font-semibold text-zinc-900 mb-4">🏆 Leaderboard</h3>

      {/* Bar chart visual */}
      <div className="flex items-end justify-center gap-3 mb-5 h-28">
        {leaderboard.map((rep, index) => {
          const heightPct = maxWins > 0 ? (rep.wins / maxWins) * 100 : 0;
          const minH = rep.wins > 0 ? 16 : 4;
          return (
            <div key={rep.name} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs font-bold text-zinc-700">{rep.wins}</span>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${Math.max(minH, (heightPct / 100) * 96)}px`,
                  background: COLORS[index] || "#e4e4e7",
                  opacity: rep.wins === 0 ? 0.3 : 1,
                }}
              />
              <span className="text-xs text-zinc-500 font-medium truncate w-full text-center">{rep.name}</span>
            </div>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-2 flex-1">
        {leaderboard.map((rep, index) => (
          <div
            key={rep.name}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50/80 hover:bg-zinc-100/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: COLORS[index] || "#e4e4e7" }}
              />
              <span className="text-sm font-medium text-zinc-900">{rep.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900">{rep.wins}</span>
              <span className="text-xs text-zinc-400">wins</span>
              {rep.revenue > 0 && (
                <span className="text-xs text-emerald-600 font-medium ml-1">${rep.revenue.toLocaleString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}