import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { TrendingUp, DollarSign, Clock, AlertCircle } from "lucide-react";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import StatCard from "../components/dashboard/StatCard";



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
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list(),
    initialData: [],
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["timeEntries"],
    queryFn: () => base44.entities.TimeEntry.list(),
    initialData: [],
  });

  // Calculate lead metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === "new").length;
  const closedWon = leads.filter(l => l.status === "closed_won").length;
  const closedLost = leads.filter(l => l.status === "closed_lost").length;
  const activeLeads = leads.filter(l => !["closed_won", "closed_lost"].includes(l.status)).length;

  // Calculate financial metrics
  const totalRevenue = leads
    .filter(l => l.status === "closed_won")
    .reduce((sum, l) => sum + (l.project_price || 0), 0);
  const potentialRevenue = leads
    .filter(l => !["closed_won", "closed_lost"].includes(l.status))
    .reduce((sum, l) => sum + (l.project_price || 0), 0);
  const totalHours = leads.reduce((sum, l) => sum + (l.total_hours || 0), 0);

  // Lead status distribution for pie chart
  const statusDistribution = [
    { name: "New", value: newLeads, color: "#71717a" },
    { name: "Active", value: activeLeads - newLeads, color: "#8b5cf6" },
    { name: "Won", value: closedWon, color: "#10b981" },
    { name: "Lost", value: closedLost, color: "#ef4444" },
  ].filter(item => item.value > 0);

  // Monthly trend (group by created month)
  const monthlyData = leads.reduce((acc, lead) => {
    const month = new Date(lead.created_date).toLocaleDateString('en-US', { month: 'short' });
    if (!acc[month]) acc[month] = { name: month, new: 0, won: 0, lost: 0 };
    if (lead.status === "new") acc[month].new++;
    if (lead.status === "closed_won") acc[month].won++;
    if (lead.status === "closed_lost") acc[month].lost++;
    return acc;
  }, {});
  const monthlyTrend = Object.values(monthlyData).slice(-6);

  // Revenue vs Hours data
  const revenueHoursData = leads
    .filter(l => l.status === "closed_won" && (l.project_price > 0 || l.total_hours > 0))
    .slice(0, 10)
    .map(l => ({
      name: l.business_name.substring(0, 15),
      revenue: l.project_price || 0,
      hours: l.total_hours || 0,
    }));

  // Time by EC Rep
  const timeByRep = timeEntries
    .filter(e => e.clock_out && e.duration_minutes)
    .reduce((acc, entry) => {
      const rep = entry.user_email?.split('@')[0] || 'Unknown';
      if (!acc[rep]) acc[rep] = 0;
      acc[rep] += entry.duration_minutes / 60;
      return acc;
    }, {});

  const repTimeData = Object.entries(timeByRep)
    .map(([name, hours]) => ({ name, hours: parseFloat(hours.toFixed(2)) }))
    .sort((a, b) => b.hours - a.hours);

  const stats = [
    { title: "Total Leads", value: totalLeads.toString(), change: newLeads, icon: TrendingUp, color: "violet" },
    { title: "Closed Won", value: closedWon.toString(), change: closedWon > 0 ? ((closedWon / totalLeads) * 100).toFixed(1) : 0, icon: TrendingUp, color: "emerald" },
    { title: "Closed Lost", value: closedLost.toString(), change: closedLost > 0 ? -((closedLost / totalLeads) * 100).toFixed(1) : 0, icon: AlertCircle, color: "rose" },
    { title: "Total Revenue", value: `$${(totalRevenue / 1000).toFixed(1)}K`, change: potentialRevenue > 0 ? ((potentialRevenue / 1000)).toFixed(1) : 0, icon: DollarSign, color: "sky" },
  ];

  return (
    <PageTransition>
      <TopBar title="Sales Analytics" subtitle="Track leads, revenue, and performance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Lead Performance Section */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">Lead Performance</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white border border-zinc-200/60 rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Lead Trends</h3>
          <p className="text-xs text-zinc-400 mb-6">New, Won & Lost over time</p>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="new" stroke="#71717a" strokeWidth={2} dot={{ r: 3 }} name="New" />
                <Line type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Won" />
                <Line type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Lost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-zinc-200/60 rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Lead Status</h3>
          <p className="text-xs text-zinc-400 mb-4">Current distribution</p>
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {statusDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-zinc-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
                        <p>{payload[0].name}: {payload[0].value} leads</p>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-600">{item.name}</span>
                </div>
                <span className="text-zinc-400 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue & Hours Section */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">Revenue & Time Investment</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue vs Hours Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white border border-zinc-200/60 rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Revenue by Project</h3>
          <p className="text-xs text-zinc-400 mb-6">Top 10 closed won deals</p>
          <div className="h-64">
            {revenueHoursData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={revenueHoursData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} width={80} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 6, 6, 0]} name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
                No closed deals yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Hours Investment */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-zinc-200/60 rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Time Investment</h3>
          <p className="text-xs text-zinc-400 mb-6">Hours spent per project</p>
          <div className="h-64">
            {revenueHoursData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={revenueHoursData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} width={80} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
                No time tracked yet
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* EC Rep Performance */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">EC Rep Performance</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white border border-zinc-200/60 rounded-2xl p-6 mb-6"
      >
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">Time Tracked by EC Rep</h3>
        <p className="text-xs text-zinc-400 mb-6">Total hours logged per representative</p>
        <div className="h-64">
          {repTimeData.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={repTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
              No time tracked yet
            </div>
          )}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/60 rounded-2xl p-6"
        >
          <DollarSign className="w-8 h-8 text-emerald-600 mb-3" />
          <p className="text-xs text-emerald-600 font-medium mb-1">Total Revenue (Won)</p>
          <p className="text-2xl font-bold text-emerald-900">${totalRevenue.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200/60 rounded-2xl p-6"
        >
          <DollarSign className="w-8 h-8 text-violet-600 mb-3" />
          <p className="text-xs text-violet-600 font-medium mb-1">Potential Revenue (Pipeline)</p>
          <p className="text-2xl font-bold text-violet-900">${potentialRevenue.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200/60 rounded-2xl p-6"
        >
          <Clock className="w-8 h-8 text-sky-600 mb-3" />
          <p className="text-xs text-sky-600 font-medium mb-1">Total Hours Tracked</p>
          <p className="text-2xl font-bold text-sky-900">{totalHours.toFixed(1)}h</p>
        </motion.div>
      </div>
    </PageTransition>
  );
}