import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import ProjectCard from "../components/dashboard/ProjectCard";
import ProjectFormDialog from "../components/projects/ProjectFormDialog";

export default function Projects() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
      setEditingProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const handleSubmit = (data) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageTransition>
      <TopBar title="Projects" subtitle={`${projects.length} total projects`} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-zinc-200/60 rounded-xl h-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white border-zinc-200/60 rounded-xl h-10">
            <Filter className="w-3.5 h-3.5 text-zinc-400 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => { setEditingProject(null); setShowForm(true); }}
          className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-10 px-4 shadow-lg shadow-zinc-900/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-zinc-200/60 rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-zinc-100 rounded w-20 mb-3" />
                <div className="h-4 bg-zinc-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-zinc-50 rounded w-full mb-4" />
                <div className="h-1.5 bg-zinc-100 rounded-full" />
              </div>
            ))
          : filteredProjects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onClick={() => { setEditingProject(project); setShowForm(true); }}
              />
            ))
        }
      </div>

      {filteredProjects.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-6 h-6 text-zinc-300" />
          </div>
          <p className="text-sm text-zinc-500 font-medium">No projects found</p>
          <p className="text-xs text-zinc-400 mt-1">Create your first project to get started</p>
        </div>
      )}

      <ProjectFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        project={editingProject}
        onSubmit={handleSubmit}
        onDelete={editingProject ? () => { deleteMutation.mutate(editingProject.id); setShowForm(false); setEditingProject(null); } : null}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </PageTransition>
  );
}