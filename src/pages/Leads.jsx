import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import LeadCard from "../components/leads/LeadCard";
import LeadFormDialog from "../components/leads/LeadFormDialog";
import LeadsToCall from "../components/leads/LeadsToCall";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const stages = [
  { id: "new", label: "New", color: "bg-zinc-100" },
  { id: "contacted", label: "Contacted", color: "bg-blue-100" },
  { id: "interested", label: "Interested", color: "bg-violet-100" },
  { id: "proposal_sent", label: "Proposal Sent", color: "bg-amber-100" },
  { id: "negotiating", label: "Negotiating", color: "bg-orange-100" },
  { id: "soft_close", label: "Soft Close", color: "bg-emerald-100" },
  { id: "closed_won", label: "Closed Won", color: "bg-green-100" },
  { id: "closed_lost", label: "Closed Lost", color: "bg-rose-100" },
  { id: "closed", label: "Closed", color: "bg-slate-100" },
];

export default function Leads() {
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list("-created_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Lead.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setShowForm(false);
      setEditingLead(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Lead.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setShowForm(false);
      setEditingLead(null);
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const handleSubmit = (data) => {
    if (editingLead) {
      updateMutation.mutate({ id: editingLead.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const leadId = result.draggableId;
    let newStatus = result.destination.droppableId;
    
    // If dropped in "closed" column, keep the original closed status
    if (newStatus === "closed") {
      const lead = leads.find(l => l.id === leadId);
      // If already closed_won or closed_lost, keep it, otherwise default to closed_won
      if (lead?.status !== "closed_won" && lead?.status !== "closed_lost") {
        newStatus = "closed_won";
      } else {
        return; // Already in closed status, no update needed
      }
    }
    
    updateMutation.mutate({
      id: leadId,
      data: { status: newStatus },
    });
  };

  const handleCallUpdate = (leadId, data) => {
    updateLeadMutation.mutate({ id: leadId, data });
  };

  // Separate leads: uncalled leads vs pipeline leads (exclude closed_lost)
  const leadsToCall = leads.filter(l => l.status !== "closed_lost" && (!l.called || (l.called && !l.interested)));
  const pipelineLeads = leads.filter(l => l.status !== "closed_lost" && l.called && l.interested);

  const groupedLeads = stages.reduce((acc, stage) => {
    if (stage.id === "closed") {
      acc[stage.id] = pipelineLeads.filter((l) => l.status === "closed_won" || l.status === "closed_lost");
    } else {
      acc[stage.id] = pipelineLeads.filter((l) => l.status === stage.id);
    }
    return acc;
  }, {});

  const totalValue = leads.reduce((sum, l) => sum + (l.project_price || 0), 0);

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Sales Pipeline</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {leads.length} leads • ${totalValue.toLocaleString()} total value
          </p>
        </div>
        <Button
          onClick={() => { setEditingLead(null); setShowForm(true); }}
          className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-lg shadow-zinc-900/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Lead
        </Button>
      </div>

      {/* Leads to Call Section */}
      {leadsToCall.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-zinc-900">Leads to Call</h2>
            <span className="text-sm text-zinc-400">({leadsToCall.length})</span>
          </div>
          <LeadsToCall leads={leadsToCall} onUpdate={handleCallUpdate} />
        </div>
      )}

      {/* Pipeline Section */}
      {pipelineLeads.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">Pipeline</h2>
          <p className="text-sm text-zinc-400">Leads that have been called and are interested</p>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <h3 className="text-sm font-semibold text-zinc-900">{stage.label}</h3>
                </div>
                <span className="text-xs text-zinc-400">
                  {groupedLeads[stage.id]?.length || 0}
                </span>
              </div>
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] p-2 rounded-xl transition-colors ${
                      snapshot.isDraggingOver ? "bg-violet-50" : "bg-zinc-50"
                    }`}
                  >
                    <div className="space-y-2">
                      {groupedLeads[stage.id]?.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <LeadCard lead={lead} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <LeadFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        lead={editingLead}
        onSubmit={handleSubmit}
        onDelete={editingLead ? () => deleteMutation.mutate(editingLead.id) : null}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </PageTransition>
  );
}