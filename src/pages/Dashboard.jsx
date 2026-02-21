import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Users, Target, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import StatCard from "../components/dashboard/StatCard";
import ChartCard from "../components/dashboard/ChartCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import ManualTimeEntryDialog from "../components/time/ManualTimeEntryDialog";


export default function Dashboard() {
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 4),
    initialData: [],
  });

  const { data: allLeads = [] } = useQuery({
    queryKey: ["all-leads"],
    queryFn: () => base44.entities.Lead.list(),
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

  // Calculate current metrics
  const totalPipeline = leads.reduce((sum, l) => sum + (l.project_price || 0), 0);
  const activeLeads = leads.filter(l => !["closed_won", "closed_lost"].includes(l.status));
  const wonLeads = leads.filter(l => l.status === "closed_won");
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.project_price || 0), 0);

  // Calculate 30-day growth
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentLeads = leads.filter(l => new Date(l.created_date) > thirtyDaysAgo);
  const oldLeads = leads.filter(l => new Date(l.created_date) <= thirtyDaysAgo);

  const recentPipeline = recentLeads.reduce((sum, l) => sum + (l.project_price || 0), 0);
  const oldPipeline = oldLeads.reduce((sum, l) => sum + (l.project_price || 0), 0) || 1;
  const pipelineGrowth = ((recentPipeline / oldPipeline) * 100);

  const recentActive = recentLeads.filter(l => !["closed_won", "closed_lost"].includes(l.status)).length;
  const oldActive = oldLeads.filter(l => !["closed_won", "closed_lost"].includes(l.status)).length || 1;
  const activeGrowth = ((recentActive / oldActive) * 100);

  const recentWon = recentLeads.filter(l => l.status === "closed_won").length;
  const oldWon = oldLeads.filter(l => l.status === "closed_won").length || 1;
  const wonGrowth = ((recentWon / oldWon) * 100);

  const recentWonValue = recentLeads.filter(l => l.status === "closed_won").reduce((sum, l) => sum + (l.project_price || 0), 0);
  const oldWonValue = oldLeads.filter(l => l.status === "closed_won").reduce((sum, l) => sum + (l.project_price || 0), 0) || 1;
  const wonValueGrowth = ((recentWonValue / oldWonValue) * 100);

  const createTimeEntryMutation = useMutation({
    mutationFn: async (data) => {
      const { lead_id, date, start_time, end_time, duration_minutes, notes } = data;
      
      const clockIn = new Date(`${date}T${start_time}`).toISOString();
      const clockOut = new Date(`${date}T${end_time}`).toISOString();
      
      const user = await base44.auth.me();
      
      const timeEntry = await base44.entities.TimeEntry.create({
        lead_id,
        user_email: user.email,
        clock_in: clockIn,
        clock_out: clockOut,
        duration_minutes,
        notes,
      });

      const lead = allLeads.find(l => l.id === lead_id);
      if (lead) {
        const newTotalHours = (lead.total_hours || 0) + (duration_minutes / 60);
        await base44.entities.Lead.update(lead_id, { total_hours: newTotalHours });
      }

      return timeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["all-leads"] });
      setShowTimeDialog(false);
    },
  });

  const statCards = [
    {
      title: "Pipeline Value",
      value: `$${totalPipeline.toLocaleString()}`,
      change: pipelineGrowth,
      icon: DollarSign,
      color: "violet",
    },
    {
      title: "Active Leads",
      value: activeLeads.length.toString(),
      change: activeGrowth,
      icon: Target,
      color: "sky",
    },
    {
      title: "Closed Won",
      value: wonLeads.length.toString(),
      change: wonGrowth,
      icon: TrendingUp,
      color: "emerald",
    },
    {
      title: "Won Value",
      value: `$${wonValue.toLocaleString()}`,
      change: wonValueGrowth,
      icon: DollarSign,
      color: "amber",
    },
  ];

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">Welcome back, here's your overview</p>
        </div>
        <Button 
          onClick={() => setShowTimeDialog(true)}
          className="bg-violet-600 hover:bg-violet-700 rounded-xl shadow-lg shadow-violet-600/20"
        >
          <Clock className="w-4 h-4 mr-2" />
          Enter Time
        </Button>
      </div>

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
          <ChartCard 
            title="Revenue Overview" 
            subtitle="Closed won revenue by day"
            selectedPeriod={revenuePeriod}
            onPeriodChange={setRevenuePeriod}
            data={(() => {
              // Start from Feb 1, 2026 at $0
              const startDate = new Date('2026-02-01');
              const today = new Date();
              
              // Determine filter date based on period
              let filterDate = new Date(startDate);
              if (revenuePeriod === "7D") {
                filterDate = new Date(today);
                filterDate.setDate(filterDate.getDate() - 7);
              } else if (revenuePeriod === "1M") {
                filterDate = new Date(today);
                filterDate.setMonth(filterDate.getMonth() - 1);
              } else if (revenuePeriod === "1Y") {
                filterDate = new Date(today);
                filterDate.setFullYear(filterDate.getFullYear() - 1);
              }
              
              // Use the later of startDate or filterDate
              const effectiveStart = filterDate > startDate ? filterDate : startDate;
              
              const dailyRevenue = {};
              
              // Initialize all days from effective start to today with $0
              for (let d = new Date(effectiveStart); d <= today; d.setDate(d.getDate() + 1)) {
                const dateKey = d.toISOString().split('T')[0];
                dailyRevenue[dateKey] = 0;
              }
              
              // Add revenue from closed won leads based on their created date
              leads
                .filter(l => l.status === "closed_won" && l.project_price > 0)
                .forEach(lead => {
                  const leadDate = new Date(lead.created_date).toISOString().split('T')[0];
                  if (dailyRevenue.hasOwnProperty(leadDate)) {
                    dailyRevenue[leadDate] += lead.project_price;
                  }
                });
              
              // Calculate cumulative revenue from Feb 1st
              let cumulative = 0;
              const allDates = Object.keys(dailyRevenue).sort();
              
              // Get cumulative at start of period
              leads
                .filter(l => l.status === "closed_won" && l.project_price > 0)
                .forEach(lead => {
                  const leadDate = new Date(lead.created_date);
                  if (leadDate < effectiveStart && leadDate >= startDate) {
                    cumulative += lead.project_price;
                  }
                });
              
              return allDates.map(date => {
                cumulative += dailyRevenue[date];
                const d = new Date(date);
                return {
                  name: `${d.getMonth() + 1}/${d.getDate()}`,
                  value: cumulative
                };
              });
            })()} 
          />
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

      <ManualTimeEntryDialog
        open={showTimeDialog}
        onOpenChange={setShowTimeDialog}
        leads={allLeads}
        onSubmit={(data) => createTimeEntryMutation.mutate(data)}
        isSubmitting={createTimeEntryMutation.isPending}
      />
    </PageTransition>
  );
}