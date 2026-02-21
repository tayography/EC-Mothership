import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Play, Square } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";

export default function TimeTracker({ leads = [], user }) {
  const [activeEntry, setActiveEntry] = useState(null);
  const [selectedLead, setSelectedLead] = useState("");
  const [notes, setNotes] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (activeEntry) {
      const interval = setInterval(() => {
        const mins = differenceInMinutes(new Date(), new Date(activeEntry.clock_in));
        setElapsed(mins);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeEntry]);

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const entry = await base44.entities.TimeEntry.create({
        lead_id: selectedLead || null,
        user_email: user?.email,
        clock_in: new Date().toISOString(),
        notes: notes,
      });
      return entry;
    },
    onSuccess: (entry) => {
      setActiveEntry(entry);
      setNotes("");
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const clockOut = new Date().toISOString();
      const duration = differenceInMinutes(new Date(clockOut), new Date(activeEntry.clock_in));
      
      await base44.entities.TimeEntry.update(activeEntry.id, {
        clock_out: clockOut,
        duration_minutes: duration,
      });

      // Update lead total hours
      if (activeEntry.lead_id) {
        const lead = leads.find(l => l.id === activeEntry.lead_id);
        if (lead) {
          await base44.entities.Lead.update(lead.id, {
            total_hours: (lead.total_hours || 0) + (duration / 60),
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setActiveEntry(null);
      setSelectedLead("");
      setElapsed(0);
    },
  });

  const formatElapsed = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <Clock className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Time Tracker</h3>
          <p className="text-xs text-zinc-400">Clock in and out for leads</p>
        </div>
      </div>

      {activeEntry ? (
        <div className="space-y-4">
          <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-violet-600 font-medium">Active Session</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-600 animate-pulse" />
                <span className="text-2xl font-mono font-bold text-violet-600">
                  {formatElapsed(elapsed)}
                </span>
              </div>
            </div>
            {activeEntry.lead_id && (
              <p className="text-xs text-violet-600">
                Working on: {leads.find(l => l.id === activeEntry.lead_id)?.business_name || "Unknown"}
              </p>
            )}
            {activeEntry.notes && (
              <p className="text-xs text-violet-600 mt-1">{activeEntry.notes}</p>
            )}
          </div>
          <Button
            onClick={() => clockOutMutation.mutate()}
            disabled={clockOutMutation.isPending}
            className="w-full bg-rose-500 hover:bg-rose-600 rounded-xl"
          >
            <Square className="w-4 h-4 mr-2" />
            Clock Out
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Lead (Optional)</Label>
            <Select value={selectedLead} onValueChange={setSelectedLead}>
              <SelectTrigger className="rounded-xl border-zinc-200/60">
                <SelectValue placeholder="Select a lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>No lead</SelectItem>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.business_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What will you work on?"
              className="rounded-xl border-zinc-200/60"
            />
          </div>
          <Button
            onClick={() => clockInMutation.mutate()}
            disabled={clockInMutation.isPending}
            className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl"
          >
            <Play className="w-4 h-4 mr-2" />
            Clock In
          </Button>
        </div>
      )}
    </div>
  );
}