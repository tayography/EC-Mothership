import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Phone, Mail, User, Clock, DollarSign, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PageTransition from "../components/layout/PageTransition";
import { createPageUrl } from "@/utils";

export default function LeadProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const leadId = urlParams.get("id");
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => {});
  }, []);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      const leads = await base44.entities.Lead.list();
      return leads.find(l => l.id === leadId);
    },
    enabled: !!leadId,
  });

  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (lead) {
      setFormData(lead);
    }
  }, [lead]);

  React.useEffect(() => {
    if (currentUser && lead) {
      const isAdmin = currentUser.role === 'admin';
      const isAssignedRep = lead.ec_rep === currentUser.full_name || lead.ec_rep === currentUser.email;
      setCanEdit(isAdmin || isAssignedRep);
    }
  }, [currentUser, lead]);

  const updateMutation = useMutation({
    mutationFn: (data) => {
      if (!canEdit) {
        throw new Error("You don't have permission to edit this lead");
      }
      return base44.entities.Lead.update(leadId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const handleChange = (field, value) => {
    if (!canEdit) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!canEdit) return;
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-100 rounded w-48 mb-6" />
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="h-4 bg-zinc-100 rounded w-full" />
            <div className="h-4 bg-zinc-100 rounded w-3/4" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!lead) {
    return (
      <PageTransition>
        <div className="text-center py-12">
          <p className="text-zinc-500">Lead not found</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = createPageUrl("Leads")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {lead.business_name}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Lead Profile</p>
          </div>
          <div className="flex gap-2">
            {!canEdit && (
              <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                View only - You can only edit leads assigned to you
              </div>
            )}
            {canEdit && (
              <>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                {lead.status !== "closed_won" && lead.status !== "closed_lost" && (
                  <>
                    <Button
                      onClick={() => {
                        handleChange("status", "closed_won");
                        updateMutation.mutate({ ...formData, status: "closed_won" });
                      }}
                      disabled={updateMutation.isPending}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      Mark Won
                    </Button>
                    <Button
                      onClick={() => {
                        handleChange("status", "closed_lost");
                        updateMutation.mutate({ ...formData, status: "closed_lost" });
                      }}
                      disabled={updateMutation.isPending}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Mark Lost
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-zinc-500 mb-1.5">Business Name</Label>
                <Input
                  value={formData.business_name || ""}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-500 mb-1.5">Contact Person</Label>
                <Input
                  value={formData.contact_person || ""}
                  onChange={(e) => handleChange("contact_person", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-500 mb-1.5">Phone</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-500 mb-1.5">EC Rep</Label>
                <Input
                  value={formData.ec_rep || ""}
                  onChange={(e) => handleChange("ec_rep", e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Lead Details</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-zinc-500 mb-1.5">Status</Label>
                <Select
                  value={formData.status || "new"}
                  onValueChange={(value) => handleChange("status", value)}
                  disabled={!canEdit}
                >
                  <SelectTrigger disabled={!canEdit}>
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
                <Label className="text-xs text-zinc-500 mb-1.5">Project Price</Label>
                <Input
                  type="number"
                  value={formData.project_price || 0}
                  onChange={(e) => handleChange("project_price", parseFloat(e.target.value) || 0)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-500 mb-1.5">Lead Need</Label>
                <Textarea
                  value={formData.lead_need || ""}
                  onChange={(e) => handleChange("lead_need", e.target.value)}
                  placeholder="What does this lead need?"
                  rows={3}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-500 mb-1.5">Notes</Label>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Call Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-zinc-700">Lead Called?</Label>
                <Switch
                  checked={formData.called || false}
                  onCheckedChange={(checked) => handleChange("called", checked)}
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-zinc-700">Interested?</Label>
                <Switch
                  checked={formData.interested || false}
                  onCheckedChange={(checked) => handleChange("interested", checked)}
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Services Needed</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-zinc-700">Has Website?</Label>
                <Switch
                  checked={formData.has_website || false}
                  onCheckedChange={(checked) => handleChange("has_website", checked)}
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-zinc-700">Needs New Website?</Label>
                <Switch
                  checked={formData.needs_new_website || false}
                  onCheckedChange={(checked) => handleChange("needs_new_website", checked)}
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-zinc-700">Needs Ad Services?</Label>
                <Switch
                  checked={formData.needs_ad_services || false}
                  onCheckedChange={(checked) => handleChange("needs_ad_services", checked)}
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>

          <div className="bg-violet-50 border border-violet-200/60 rounded-2xl p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Total Hours</span>
                <span className="font-semibold text-zinc-900">{lead.total_hours?.toFixed(1) || 0}h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Created By</span>
                <span className="font-semibold text-zinc-900">{lead.created_by?.split('@')[0] || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}