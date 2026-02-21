import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock, Trash2 } from "lucide-react";

export default function TimeEntryEditDialog({ open, onOpenChange, entry, leads, onSubmit, onDelete, isSubmitting }) {
  const [form, setForm] = useState({
    lead_id: "",
    date: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  useEffect(() => {
    if (entry && open) {
      const clockInDate = new Date(entry.clock_in);
      const clockOutDate = new Date(entry.clock_out);
      
      setForm({
        lead_id: entry.lead_id || "",
        date: clockInDate.toISOString().split('T')[0],
        start_time: clockInDate.toTimeString().slice(0, 5),
        end_time: clockOutDate.toTimeString().slice(0, 5),
        notes: entry.notes || "",
      });
    }
  }, [entry, open]);

  const calculateDuration = () => {
    if (!form.start_time || !form.end_time) return { hours: 0, minutes: 0, total: 0 };
    
    const [startHour, startMin] = form.start_time.split(':').map(Number);
    const [endHour, endMin] = form.end_time.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const totalMinutes = endMinutes - startMinutes;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return { hours, minutes, total: totalMinutes };
  };

  const duration = calculateDuration();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (duration.total <= 0) {
      alert("End time must be after start time");
      return;
    }
    onSubmit({ ...form, duration_minutes: duration.total });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-zinc-200/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-600" />
            Edit Time Entry
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Lead / Project</Label>
            <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v })}>
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
            <Label className="text-xs text-zinc-500 mb-1.5 block">Date *</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-xl border-zinc-200/60"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Start Time *</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="rounded-xl border-zinc-200/60"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">End Time *</Label>
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="rounded-xl border-zinc-200/60"
                required
              />
            </div>
          </div>

          <div className="bg-violet-50 border border-violet-200/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-violet-600 font-medium">Total Duration</span>
              <span className="text-lg font-bold text-violet-900">
                {duration.hours}h {duration.minutes}m
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What did you work on?"
              className="rounded-xl border-zinc-200/60 h-20 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {onDelete && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onDelete}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="rounded-xl border-zinc-200/60"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || duration.total <= 0} 
                className="bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-lg shadow-zinc-900/10"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}