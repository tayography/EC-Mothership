import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const defaultLead = {
  business_name: "",
  phone: "",
  contact_person: "",
  call_made_by: "",
  ec_tech: "",
  has_website: false,
  needs_new_website: false,
  needs_ad_services: false,
  interested: false,
  status: "new",
  project_price: 0,
  last_contact_date: "",
  next_follow_up: "",
  notes: "",
};

export default function LeadFormDialog({ open, onOpenChange, lead, onSubmit, onDelete, isSubmitting }) {
  const [form, setForm] = useState(defaultLead);

  const commissionPeople = [
    { id: "braden", name: "Braden" },
    { id: "taylor", name: "Taylor" },
    { id: "jami", name: "Jami" }
  ];

  useEffect(() => {
    if (lead) {
      setForm({ ...defaultLead, ...lead });
    } else {
      setForm(defaultLead);
    }
  }, [lead, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl border-zinc-200/60 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {lead ? "Edit Lead" : "New Lead"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Business Name *</Label>
              <Input
                value={form.business_name}
                onChange={(e) => handleChange("business_name", e.target.value)}
                placeholder="Business name"
                className="rounded-xl border-zinc-200/60"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Contact Person</Label>
              <Input
                value={form.contact_person}
                onChange={(e) => handleChange("contact_person", e.target.value)}
                placeholder="Contact name"
                className="rounded-xl border-zinc-200/60"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Phone number"
              className="rounded-xl border-zinc-200/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Call Made By / Lead Provided By</Label>
              <Select value={form.call_made_by} onValueChange={(v) => handleChange("call_made_by", v)}>
                <SelectTrigger className="rounded-xl border-zinc-200/60">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {commissionPeople.map((person) => (
                    <SelectItem key={person.id} value={person.name}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Dedicated EC Tech</Label>
              <Select value={form.ec_tech} onValueChange={(v) => handleChange("ec_tech", v)}>
                <SelectTrigger className="rounded-xl border-zinc-200/60">
                  <SelectValue placeholder="Select tech" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Braden">Braden</SelectItem>
                  <SelectItem value="Taylor">Taylor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Project Price ($)</Label>
              <Input
                type="number"
                min="0"
                value={form.project_price}
                onChange={(e) => handleChange("project_price", parseFloat(e.target.value) || 0)}
                className="rounded-xl border-zinc-200/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Status</Label>
              <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger className="rounded-xl border-zinc-200/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="soft_close">Soft Close</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Last Contact</Label>
              <Input
                type="date"
                value={form.last_contact_date}
                onChange={(e) => handleChange("last_contact_date", e.target.value)}
                className="rounded-xl border-zinc-200/60"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Next Follow-Up</Label>
            <Input
              type="date"
              value={form.next_follow_up}
              onChange={(e) => handleChange("next_follow_up", e.target.value)}
              className="rounded-xl border-zinc-200/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-xl">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-600">Has Website</Label>
              <Switch checked={form.has_website} onCheckedChange={(v) => handleChange("has_website", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-600">Needs Website</Label>
              <Switch checked={form.needs_new_website} onCheckedChange={(v) => handleChange("needs_new_website", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-600">Needs Ad Services</Label>
              <Switch checked={form.needs_ad_services} onCheckedChange={(v) => handleChange("needs_ad_services", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-600">Interested</Label>
              <Switch checked={form.interested} onCheckedChange={(v) => handleChange("interested", v)} />
            </div>
          </div>

          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Add notes about this lead..."
              className="rounded-xl border-zinc-200/60 h-20 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {onDelete && (
              <Button type="button" variant="ghost" onClick={onDelete} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-zinc-200/60">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-lg shadow-zinc-900/10">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {lead ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}