import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Users, Target, TrendingUp } from "lucide-react";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import StatCard from "../components/dashboard/StatCard";
import ChartCard from "../components/dashboard/ChartCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";


export default function Dashboard() {
  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 4),
    initialData: [],
  });

  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-created_date", 6),
    initialData: [],
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ["metrics"],
    queryFn: () => base44.entities.Metric.list("-created_date"),
    initialData: [],
  });

  const totalPipeline = leads.reduce((sum, l) => sum + (l.project_price || 0), 0);
  const activeLeads = leads.filter(l => !["closed_won", "closed_lost"].includes(l.status));
  const wonLeads = leads.filter(l => l.status === "closed_won");
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.project_price || 0), 0);

  const statCards = [
    {
      title: "Pipeline Value",
      value: `$${totalPipeline.toLocaleString()}`,
      change: 18.5,
      icon: DollarSign,
      color: "violet",
    },
    {
      title: "Active Leads",
      value: activeLeads.length.toString(),
      change: 12.3,
      icon: Target,
      color: "sky",
    },
    {
      title: "Closed Won",
      value: wonLeads.length.toString(),
      change: 8.2,
      icon: TrendingUp,
      color: "emerald",
    },
    {
      title: "Won Value",
      value: `$${wonValue.toLocaleString()}`,
      change: 15.7,
      icon: DollarSign,
      color: "amber",
    },
  ];

  return (
    <PageTransition>
      <TopBar title="Dashboard" subtitle="Welcome back, here's your overview" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Chart - spans 2 cols */}
        <div className="lg:col-span-2">
          <ChartCard title="Revenue Overview" subtitle="Monthly recurring revenue" />
        </div>

        {/* Activity Feed */}
        <div className="bg-white border border-zinc-200/60 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Recent Activity</h3>
          <ActivityFeed activities={activities} isLoading={loadingActivities} />
        </div>
      </div>

      {/* Recent Leads */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-900">Recent Leads</h3>
          <a href="/Leads" className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors">
            View pipeline →
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingLeads
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white border border-zinc-200/60 rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-zinc-100 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-zinc-50 rounded w-full mb-2" />
                  <div className="h-3 bg-zinc-50 rounded w-2/3" />
                </div>
              ))
            : leads.map((lead, i) => (
                <div
                  key={lead.id}
                  className="bg-white border border-zinc-200/60 rounded-2xl p-4 hover:shadow-lg transition-all"
                >
                  <h4 className="font-semibold text-sm text-zinc-900 mb-2">{lead.business_name}</h4>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="capitalize">{lead.status.replace(/_/g, " ")}</span>
                    {lead.project_price > 0 && (
                      <span className="text-emerald-600 font-medium">${lead.project_price.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </PageTransition>
  );
}