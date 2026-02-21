import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "../components/layout/PageTransition";
import TopBar from "../components/layout/TopBar";
import LeadCard from "../components/leads/LeadCard";
import LeadFormDialog from "../components/leads/LeadFormDialog";
import LeadsToCall from "../components/leads/LeadsToCall";
import { motion, AnimatePresence } from "framer-motion";

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
  const [expandedStages, setExpandedStages] = useState({});
  const queryClient = useQueryClient();

  const toggleStage = (stageId) => {
    setExpandedStages(prev => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

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

      <div className="space-y-3">
        {stages.map((stage) => {
          const stageLeads = groupedLeads[stage.id] || [];
          const isExpanded = expandedStages[stage.id];
          const displayLeads = isExpanded ? stageLeads : stageLeads.slice(0, 1);

          if (stageLeads.length === 0) return null;

          return (
            <div key={stage.id} className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">{stage.label}</h3>
                    <p className="text-xs text-zinc-400">{stageLeads.length} lead{stageLeads.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                {stageLeads.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStage(stage.id)}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                )}
              </div>

              <div className="px-4 pb-4 space-y-2">
                <AnimatePresence initial={false}>
                  {displayLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LeadCard lead={lead} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!isExpanded && stageLeads.length > 1 && (
                  <button
                    onClick={() => toggleStage(stage.id)}
                    className="w-full text-xs text-violet-600 hover:text-violet-700 font-medium py-2 text-center"
                  >
                    + {stageLeads.length - 1} more lead{stageLeads.length - 1 !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

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