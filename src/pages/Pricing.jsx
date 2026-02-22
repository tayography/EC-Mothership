import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, Pencil } from "lucide-react";
import PageTransition from "../components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import ProductFormDialog from "../components/pricing/ProductFormDialog";

export default function Pricing() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => {});
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list("-created_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false);
      setEditingProduct(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false);
      setEditingProduct(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const canEdit = currentUser?.role === 'admin';
  const activeProducts = products.filter(p => p.is_active);

  return (
    <PageTransition>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Pricing</h1>
          <p className="text-sm text-zinc-400 mt-1">Choose the perfect plan for your needs</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
            className="bg-zinc-900 hover:bg-zinc-800 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Product
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeProducts.map((option) => (
          <div
            key={option.id}
            className="bg-white border border-zinc-200/60 rounded-2xl p-6 hover:shadow-lg transition-all relative group"
          >
            {canEdit && (
              <button
                onClick={() => { setEditingProduct(option); setShowForm(true); }}
                className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-200"
              >
                <Pencil className="w-4 h-4 text-zinc-600" />
              </button>
            )}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">{option.name}</h3>
              <p className="text-sm text-zinc-500 mb-4">{option.description}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-zinc-900">${option.price}</span>
                <span className="text-sm text-zinc-500">{option.period}</span>
              </div>
              {option.alternate_price && (
                <p className="text-xs text-zinc-400 mt-1">or {option.alternate_price}</p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {(option.features || []).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-zinc-700">{feature}</span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-zinc-900 hover:bg-zinc-800 rounded-xl">
              Get Started
            </Button>
          </div>
        ))}
      </div>

      <ProductFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        product={editingProduct}
        onSubmit={handleSubmit}
        onDelete={editingProduct ? () => deleteMutation.mutate(editingProduct.id) : null}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </PageTransition>
  );
}