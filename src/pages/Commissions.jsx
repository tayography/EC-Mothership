import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, User, Award, Plus, Pencil } from "lucide-react";
import PageTransition from "../components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import CommissionFormDialog from "../components/commissions/CommissionFormDialog";

export default function Commissions() {
  const [showForm, setShowForm] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => {});
  }, []);

  const { data: commissions = [] } = useQuery({
    queryKey: ["commissions"],
    queryFn: () => base44.entities.CommissionStructure.list("-created_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CommissionStructure.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CommissionStructure.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      setShowForm(false);
      setEditingCommission(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CommissionStructure.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      setShowForm(false);
      setEditingCommission(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingCommission) {
      updateMutation.mutate({ id: editingCommission.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const canEdit = currentUser?.role === 'admin';
  const activeCommissions = commissions.filter(c => c.is_active);

  return (
    <PageTransition>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Commission Structure</h1>
          <p className="text-sm text-zinc-400 mt-1">How commissions are calculated and distributed</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => { setEditingCommission(null); setShowForm(true); }}
            className="bg-zinc-900 hover:bg-zinc-800 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Commission
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {activeCommissions.map((commission) => {
          const iconMap = {
            "dollar-sign": DollarSign,
            "user": User,
            "award": Award
          };
          const Icon = iconMap[commission.icon] || DollarSign;

          return (
            <div key={commission.id} className="bg-white border border-zinc-200/60 rounded-2xl p-6 relative group">
              {canEdit && (
                <button
                  onClick={() => { setEditingCommission(commission); setShowForm(true); }}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-200"
                >
                  <Pencil className="w-4 h-4 text-zinc-600" />
                </button>
              )}
              <div className="flex items-start gap-4">
                <div className="bg-stone-700 rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-sky-500 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">{commission.name}</h3>
                  <p className="text-sm text-zinc-600 mb-3">{commission.description}</p>
                  <div className="bg-stone-700 p-4 rounded-xl border border-violet-200">
                    <p className="text-sky-500 text-2xl font-bold">{commission.percentage}%</p>
                    <p className="text-sky-400 text-sm">of project price</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* EC Tech Note */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-2">EC Tech Assignment</h3>
          <p className="text-sm text-zinc-600">
            Each lead should have a dedicated EC Tech (Braden or Taylor) assigned. The EC Tech is responsible for deploying and building the site. This is tracked in the lead details under "Dedicated EC Tech".
          </p>
        </div>
      </div>

      <CommissionFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        commission={editingCommission}
        onSubmit={handleSubmit}
        onDelete={editingCommission ? () => deleteMutation.mutate(editingCommission.id) : null}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </PageTransition>);

}