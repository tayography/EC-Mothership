import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Users, FolderKanban, Zap } from "lucide-react";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import StatCard from "../components/dashboard/StatCard";
import ChartCard from "../components/dashboard/ChartCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import ProjectCard from "../components/dashboard/ProjectCard";

export default function Dashboard() {
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date", 4),
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

  const statCards = [
    {
      title: "Total Revenue",
      value: metrics.find(m => m.category === "revenue")
        ? `$${metrics.find(m => m.category === "revenue").value.toLocaleString()}`
        : "$0",
      change: metrics.find(m => m.category === "revenue")?.previous_value
        ? (((metrics.find(m => m.category === "revenue").value - metrics.find(m => m.category === "revenue").previous_value) / metrics.find(m => m.category === "revenue").previous_value) * 100).toFixed(1)
        : 0,
      icon: DollarSign,
      color: "violet",
    },
    {
      title: "Active Users",
      value: metrics.find(m => m.category === "users")?.value?.toLocaleString() || "0",
      change: 12.5,
      icon: Users,
      color: "sky",
    },
    {
      title: "Active Projects",
      value: projects.length.toString(),
      change: 8.2,
      icon: FolderKanban,
      color: "emerald",
    },
    {
      title: "Performance",
      value: metrics.find(m => m.category === "performance")?.value
        ? `${metrics.find(m => m.category === "performance").value}%`
        : "98.5%",
      change: 2.1,
      icon: Zap,
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

      {/* Recent Projects */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-900">Recent Projects</h3>
          <a href="/Projects" className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors">
            View all →
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingProjects
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white border border-zinc-200/60 rounded-2xl p-5 animate-pulse">
                  <div className="h-5 bg-zinc-100 rounded w-16 mb-3" />
                  <div className="h-4 bg-zinc-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-zinc-50 rounded w-full mb-4" />
                  <div className="h-1.5 bg-zinc-100 rounded-full" />
                </div>
              ))
            : projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))
          }
        </div>
      </div>
    </PageTransition>
  );
}