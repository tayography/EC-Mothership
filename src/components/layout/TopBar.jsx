import React, { useState, useEffect } from "react";
import { Search, Bell, User } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TopBar({ title, subtitle }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-xl bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-all shadow-sm">
          <Search className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-all shadow-sm relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-500 rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shadow-lg shadow-violet-500/20 ml-1">
          {user?.full_name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
        </div>
      </div>
    </div>
  );
}