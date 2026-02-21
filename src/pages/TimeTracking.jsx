import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Clock, User } from "lucide-react";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import TimeTracker from "../components/time/TimeTracker";

export default function TimeTracking() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list(),
    initialData: [],
  });

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ["timeEntries"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date", 50),
    initialData: [],
  });

  const userEntries = timeEntries.filter(e => e.user_email === user?.email && e.clock_out);
  const totalHours = userEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 60;

  return (
    <PageTransition>
      <TopBar title="Time Tracking" subtitle="Track your time on leads" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <TimeTracker leads={leads} user={user} />

        <div className="lg:col-span-2 bg-white border border-zinc-200/60 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Your Recent Time Entries</h3>
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-sm text-zinc-400 text-center py-8">Loading...</div>
            ) : userEntries.length === 0 ? (
              <div className="text-sm text-zinc-400 text-center py-8">No time entries yet</div>
            ) : (
              userEntries.map((entry) => {
                const lead = leads.find(l => l.id === entry.lead_id);
                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {lead?.business_name || "General Time"}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-zinc-400">{entry.notes}</p>
                        )}
                        <p className="text-xs text-zinc-400">
                          {format(new Date(entry.clock_in), "MMM d, h:mm a")} - {format(new Date(entry.clock_out), "h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-900">
                        {(entry.duration_minutes / 60).toFixed(2)}h
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Time by Lead</h3>
        <div className="space-y-2">
          {leads
            .filter(l => l.total_hours > 0)
            .sort((a, b) => b.total_hours - a.total_hours)
            .map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{lead.business_name}</p>
                  <p className="text-xs text-zinc-400">{lead.contact_person}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-900">{lead.total_hours.toFixed(2)}h</p>
                  {lead.project_price > 0 && (
                    <p className="text-xs text-emerald-600">${lead.project_price.toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          {leads.filter(l => l.total_hours > 0).length === 0 && (
            <div className="text-sm text-zinc-400 text-center py-8">No time tracked yet</div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}