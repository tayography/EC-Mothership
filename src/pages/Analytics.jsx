import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, Activity, Target } from "lucide-react";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import StatCard from "../components/dashboard/StatCard";

const barData = [
  { name: "Mon", value: 420 },
  { name: "Tue", value: 380 },
  { name: "Wed", value: 520 },
  { name: "Thu", value: 490 },
  { name: "Fri", value: 610 },
  { name: "Sat", value: 340 },
  { name: "Sun", value: 280 },
];

const pieData = [
  { name: "Development", value: 40, color: "#8b5cf6" },
  { name: "Design", value: 25, color: "#06b6d4" },
  { name: "Marketing", value: 20, color: "#f59e0b" },
  { name: "Operations", value: 15, color: "#10b981" },
];

const areaData = [
  { name: "Jan", users: 1200, sessions: 3400 },
  { name: "Feb", users: 1400, sessions: 3800 },
  { name: "Mar", users: 1800, sessions: 4200 },
  { name: "Apr", users: 1600, sessions: 4100 },
  { name: "May", users: 2100, sessions: 5200 },
  { name: "Jun", users: 2400, sessions: 5800 },
];

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((item, i) => (
          <p key={i} className="text-zinc-300">{item.name}: {item.value.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
    initialData: [],
  });

  const stats = [
    { title: "Page Views", value: "24.5K", change: 18.2, icon: TrendingUp, color: "violet" },
    { title: "Unique Visitors", value: "8,234", change: 12.1, icon: Users, color: "sky" },
    { title: "Bounce Rate", value: "32.4%", change: -4.2, icon: Activity, color: "emerald" },
    { title: "Conversion", value: "3.8%", change: 6.7, icon: Target, color: "amber" },
  ];

  return (
    <PageTransition>
      <TopBar title="Analytics" subtitle="Track performance and engagement" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Bento Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white border border-zinc-200/60 rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Users & Sessions</h3>
          <p className="text-xs text-zinc-400 mb-6">6-month trend overview</p>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorUsers)" dot={false} />
                <Area type="monotone" dataKey="sessions" stroke="#06b6d4" strokeWidth={2} fill="url(#colorSessions)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-zinc-200/60 rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">By Category</h3>
          <p className="text-xs text-zinc-400 mb-4">Project distribution</p>
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-zinc-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
                        <p>{payload[0].name}: {payload[0].value}%</p>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-600">{item.name}</span>
                </div>
                <span className="text-zinc-400 font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white border border-zinc-200/60 rounded-2xl p-6"
      >
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">Weekly Activity</h3>
        <p className="text-xs text-zinc-400 mb-6">Actions per day this week</p>
        <div className="h-48">
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </PageTransition>
  );
}