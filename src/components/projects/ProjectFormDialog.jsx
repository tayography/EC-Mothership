import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Loader2 } from "lucide-react";

const defaultProject = {
  name: "",
  description: "",
  status: "planning",
  priority: "medium",
  category: "development",
  progress: 0,
  due_date: "",
  budget: 0,
};

export default function ProjectFormDialog({ open, onOpenChange, project, onSubmit, onDelete, isSubmitting }) {
  const [form, setForm] = useState(defaultProject);

  useEffect(() => {
    if (project) {
      setForm({ ...defaultProject, ...project });
    } else {
      setForm(defaultProject);
    }
  }, [project, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-zinc-200/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {project ? "Edit Project" : "New Project"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Project Name</Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter project name"
              className="rounded-xl border-zinc-200/60"
              required
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="What's this project about?"
              className="rounded-xl border-zinc-200/60 h-20 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Status</Label>
              <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger className="rounded-xl border-zinc-200/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => handleChange("priority", v)}>
                <SelectTrigger className="rounded-xl border-zinc-200/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Category</Label>
              <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                <SelectTrigger className="rounded-xl border-zinc-200/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Due Date</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => handleChange("due_date", e.target.value)}
                className="rounded-xl border-zinc-200/60"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Progress (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.progress}
                onChange={(e) => handleChange("progress", parseInt(e.target.value) || 0)}
                className="rounded-xl border-zinc-200/60"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-500 mb-1.5 block">Budget ($)</Label>
              <Input
                type="number"
                min="0"
                value={form.budget}
                onChange={(e) => handleChange("budget", parseFloat(e.target.value) || 0)}
                className="rounded-xl border-zinc-200/60"
              />
            </div>
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
                {project ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}