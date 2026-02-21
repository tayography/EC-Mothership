import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Users, Target, TrendingUp, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import StatCard from "../components/dashboard/StatCard";
import ChartCard from "../components/dashboard/ChartCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import ManualTimeEntryDialog from "../components/time/ManualTimeEntryDialog";
import FollowUpCalendar from "../components/dashboard/FollowUpCalendar";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";


export default function Dashboard() {
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState("7D");
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

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
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
  const activeLeads = allLeads.filter(l => !["closed_won", "closed_lost"].includes(l.status));
  const totalPipeline = activeLeads.reduce((sum, l) => sum + (l.project_price || 0), 0);
  const wonLeads = allLeads.filter(l => l.status === "closed_won");
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.project_price || 0), 0);

  // Calculate 30-day growth
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentLeads = allLeads.filter(l => new Date(l.created_date) > thirtyDaysAgo);
  const oldLeads = allLeads.filter(l => new Date(l.created_date) <= thirtyDaysAgo);

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

  // Calculate leaderboard - only track Braden, Taylor, and Jami
  const peopleMap = {
    "Braden": "braden@theendlesscreative.com",
    "Taylor": "taylor@theendlesscreative.com",
    "Jami": "Jami.schnakenberg85@gmail.com"
  };

  const leaderboard = ["Braden", "Taylor", "Jami"].map(name => {
    const userWonLeads = allLeads.filter(l => 
      l.status === "closed_won" && l.created_by === peopleMap[name]
    );
    return {
      name,
      email: peopleMap[name],
      wins: userWonLeads.length,
      revenue: userWonLeads.reduce((sum, l) => sum + (l.project_price || 0), 0)
    };
  }).sort((a, b) => b.wins - a.wins);

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

      {/* Leaderboard */}
      <div className="mb-6">
        <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">🏆 Leaderboard</h3>
          <div className="space-y-2">
            {leaderboard.map((rep, index) => (
              <div
                key={rep.email}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm ${
                    index === 0 ? 'bg-amber-100 text-amber-700' :
                    index === 1 ? 'bg-zinc-200 text-zinc-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-zinc-50 text-zinc-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{rep.name}</p>
                    {rep.revenue > 0 && (
                      <p className="text-xs text-emerald-600">${rep.revenue.toLocaleString()} revenue</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900">{rep.wins}</span>
                  <span className="text-xs text-zinc-400">wins</span>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-sm text-zinc-400 text-center py-4">No reps yet</p>
            )}
          </div>
        </div>
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
              const today = new Date();
              const businessStartDate = new Date('2026-02-01');
              let startDate;
              let dateFormat;
              
              if (revenuePeriod === "7D") {
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 7);
                dateFormat = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
              } else if (revenuePeriod === "1M") {
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 30);
                dateFormat = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
              } else if (revenuePeriod === "1Y") {
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 365);
                dateFormat = (d) => `${d.toLocaleString('default', { month: 'short' })}`;
              }
              
              // Use the later date between business start and selected period
              const effectiveStartDate = startDate < businessStartDate ? businessStartDate : startDate;
              
              const dailyRevenue = {};
              
              // Initialize all days from effective start to today with $0
              for (let d = new Date(effectiveStartDate); d <= today; d.setDate(d.getDate() + 1)) {
                const dateKey = d.toISOString().split('T')[0];
                dailyRevenue[dateKey] = 0;
              }
              
              // Calculate cumulative revenue up to start of period
              let cumulativeBeforePeriod = 0;
              allLeads
                .filter(l => l.status === "closed_won" && l.project_price > 0)
                .forEach(lead => {
                  const leadDate = new Date(lead.updated_date || lead.created_date);
                  if (leadDate >= businessStartDate && leadDate < effectiveStartDate) {
                    cumulativeBeforePeriod += lead.project_price;
                  }
                });
              
              // Add revenue from closed won leads within the period
              allLeads
                .filter(l => l.status === "closed_won" && l.project_price > 0)
                .forEach(lead => {
                  const leadDate = new Date(lead.updated_date || lead.created_date);
                  const dateKey = leadDate.toISOString().split('T')[0];
                  if (dailyRevenue.hasOwnProperty(dateKey)) {
                    dailyRevenue[dateKey] += lead.project_price;
                  }
                });
              
              // Calculate cumulative revenue starting from pre-period total
              let cumulative = cumulativeBeforePeriod;
              const allDates = Object.keys(dailyRevenue).sort();
              
              return allDates.map(date => {
                cumulative += dailyRevenue[date];
                const d = new Date(date);
                return {
                  name: dateFormat(d),
                  value: cumulative
                };
              });
            })()} 
          />
        </div>

        {/* Follow-Up Calendar */}
        <FollowUpCalendar leads={allLeads} />
      </div>

      {/* Recent Leads */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-900">Recent Leads</h3>
          <a href={createPageUrl("Leads")} className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors">
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
            : leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => window.location.href = createPageUrl("LeadProfile") + `?id=${lead.id}`}
                  className="bg-white border border-zinc-200/60 rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer"
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