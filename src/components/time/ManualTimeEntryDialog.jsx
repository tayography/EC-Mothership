import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock } from "lucide-react";

export default function ManualTimeEntryDialog({ open, onOpenChange, leads, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({
    lead_id: "",
    date: new Date().toISOString().split('T')[0],
    start_time: "09:00",
    end_time: "17:00",
    notes: "",
  });

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
            Enter Time
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Lead / Project *</Label>
            <Select value={form.lead_id} onValueChange={(v) => setForm({ ...form, lead_id: v })} required>
              <SelectTrigger className="rounded-xl border-zinc-200/60">
                <SelectValue placeholder="Select a lead" />
              </SelectTrigger>
              <SelectContent>
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

          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 rounded-xl border-zinc-200/60"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || duration.total <= 0} 
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-lg shadow-zinc-900/10"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Time Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}