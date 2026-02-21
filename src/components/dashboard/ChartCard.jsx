import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const defaultData = [
  { name: "Jan", value: 2400 },
  { name: "Feb", value: 1800 },
  { name: "Mar", value: 3200 },
  { name: "Apr", value: 2800 },
  { name: "May", value: 3600 },
  { name: "Jun", value: 3200 },
  { name: "Jul", value: 4100 },
  { name: "Aug", value: 3800 },
  { name: "Sep", value: 4500 },
  { name: "Oct", value: 4200 },
  { name: "Nov", value: 5000 },
  { name: "Dec", value: 4800 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
        <p className="font-medium">{label}</p>
        <p className="text-zinc-300 mt-0.5">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function ChartCard({ title, subtitle, data = defaultData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="bg-white border border-zinc-200/60 rounded-2xl p-6 hover:shadow-lg hover:shadow-zinc-900/5 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex gap-1">
          {["7D", "1M", "1Y"].map((period) => (
            <button
              key={period}
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors first:bg-zinc-100 first:text-zinc-700"
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              dx={-8}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorValue)"
              dot={false}
              activeDot={{ r: 4, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}