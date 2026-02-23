import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import TimeTracker from "../components/time/TimeTracker";
import TimeEntryEditDialog from "../components/time/TimeEntryEditDialog";

export default function TimeTracking() {
  const [user, setUser] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const queryClient = useQueryClient();

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

  const allCompletedEntries = timeEntries.filter(e => e.clock_out);
  const userEntries = allCompletedEntries.filter(e => e.user_email === user?.email);
  const totalHours = userEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 60;

  // Group entries by user
  const entriesByUser = allCompletedEntries.reduce((acc, entry) => {
    const email = entry.user_email || 'Unknown';
    if (!acc[email]) acc[email] = [];
    acc[email].push(entry);
    return acc;
  }, {});

  const updateTimeEntryMutation = useMutation({
    mutationFn: async (data) => {
      const { lead_id, date, start_time, end_time, duration_minutes, notes } = data;
      
      const clockIn = new Date(`${date}T${start_time}`).toISOString();
      const clockOut = new Date(`${date}T${end_time}`).toISOString();
      
      const oldEntry = editingEntry;
      const oldDuration = oldEntry.duration_minutes || 0;
      
      await base44.entities.TimeEntry.update(oldEntry.id, {
        lead_id,
        clock_in: clockIn,
        clock_out: clockOut,
        duration_minutes,
        notes,
      });

      // Update old lead if it exists
      if (oldEntry.lead_id) {
        const oldLead = leads.find(l => l.id === oldEntry.lead_id);
        if (oldLead) {
          await base44.entities.Lead.update(oldEntry.lead_id, {
            total_hours: Math.max(0, (oldLead.total_hours || 0) - (oldDuration / 60)),
          });
        }
      }

      // Update new lead if it exists
      if (lead_id) {
        const newLead = leads.find(l => l.id === lead_id);
        if (newLead) {
          await base44.entities.Lead.update(lead_id, {
            total_hours: (newLead.total_hours || 0) + (duration_minutes / 60),
          });
        }
      }
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["timeEntries"] });
      const previousEntries = queryClient.getQueryData(["timeEntries"]);
      queryClient.setQueryData(["timeEntries"], old => 
        (old || []).map(entry => entry.id === editingEntry.id ? { ...entry, ...data } : entry)
      );
      return { previousEntries };
    },
    onError: (err, data, context) => {
      queryClient.setQueryData(["timeEntries"], context.previousEntries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setEditingEntry(null);
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: async () => {
      const entry = editingEntry;
      
      await base44.entities.TimeEntry.delete(entry.id);

      // Update lead total hours
      if (entry.lead_id) {
        const lead = leads.find(l => l.id === entry.lead_id);
        if (lead) {
          await base44.entities.Lead.update(entry.lead_id, {
            total_hours: Math.max(0, (lead.total_hours || 0) - ((entry.duration_minutes || 0) / 60)),
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setEditingEntry(null);
    },
  });

  return (
    <PageTransition>
      <TopBar title="Time Tracking" subtitle="Track time across all EC Reps" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <TimeTracker leads={leads} user={user} />

        <div className="lg:col-span-2 bg-white border border-zinc-200/60 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">All Time Entries</h3>
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-sm text-zinc-400 text-center py-8">Loading...</div>
            ) : allCompletedEntries.length === 0 ? (
              <div className="text-sm text-zinc-400 text-center py-8">No time entries yet</div>
            ) : (
              allCompletedEntries.map((entry) => {
                const lead = leads.find(l => l.id === entry.lead_id);
                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {lead?.business_name || "General Time"}
                        </p>
                        <p className="text-xs text-violet-600 font-medium">
                          {entry.user_email?.split('@')[0] || 'Unknown'}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-zinc-400">{entry.notes}</p>
                        )}
                        <p className="text-xs text-zinc-400">
                          {format(new Date(entry.clock_in), "MMM d, h:mm a")} - {format(new Date(entry.clock_out), "h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-zinc-900">
                          {(entry.duration_minutes / 60).toFixed(2)}h
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingEntry(entry)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      >
                        <Pencil className="w-4 h-4 text-zinc-400" />
                      </Button>
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

      <TimeEntryEditDialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        entry={editingEntry}
        leads={leads}
        onSubmit={(data) => updateTimeEntryMutation.mutate(data)}
        onDelete={() => {
          if (confirm("Are you sure you want to delete this time entry?")) {
            deleteTimeEntryMutation.mutate();
          }
        }}
        isSubmitting={updateTimeEntryMutation.isPending || deleteTimeEntryMutation.isPending}
      />
    </PageTransition>
  );
}