import React from "react";
import { motion } from "framer-motion";
import { Phone, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createPageUrl } from "@/utils";

export default function LeadsToCall({ leads, onUpdate }) {
  const [expandedId, setExpandedId] = React.useState(null);
  const [formData, setFormData] = React.useState({});

  const handleToggle = (leadId) => {
    setExpandedId(expandedId === leadId ? null : leadId);
    if (expandedId !== leadId) {
      const lead = leads.find(l => l.id === leadId);
      setFormData({
        called: lead.called || false,
        interested: lead.interested || false,
        lead_need: lead.lead_need || "",
      });
    }
  };

  const handleUpdate = (lead) => {
    onUpdate(lead.id, {
      ...formData,
      status: formData.called && formData.interested ? "interested" : lead.status,
    });
    setExpandedId(null);
  };

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <motion.div
          key={lead.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden"
        >
          <div
            className="p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
            onClick={() => handleToggle(lead.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-zinc-900">{lead.business_name}</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {lead.contact_person && `${lead.contact_person} • `}
                  {lead.phone || "No phone"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {lead.called && (
                  <div className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                    Called
                  </div>
                )}
                <Phone className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>

          {expandedId === lead.id && (
            <div className="border-t border-zinc-200 p-4 bg-zinc-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-zinc-700">Lead Called?</Label>
                  <Switch
                    checked={formData.called || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, called: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-zinc-700">Lead Interested?</Label>
                  <Switch
                    checked={formData.interested || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, interested: checked }))}
                  />
                </div>
                <div>
                  <Label className="text-sm text-zinc-700 mb-2">Lead Need</Label>
                  <Input
                    value={formData.lead_need || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, lead_need: e.target.value }))}
                    placeholder="What does the lead need?"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleUpdate(lead)}
                    size="sm"
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={() => window.location.href = createPageUrl("LeadProfile") + `?id=${lead.id}`}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}