import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, X, DollarSign, Phone, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import PageTransition from "../components/layout/PageTransition";
import { createPageUrl } from "@/utils";

export default function LeadHistory() {
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list(),
    initialData: [],
  });

  const lostLeads = leads.filter(l => l.status === "closed_lost");

  return (
    <PageTransition>
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = createPageUrl("Settings")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Lead History</h1>
          <p className="text-sm text-zinc-400 mt-1">View closed and lost leads</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <X className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-zinc-900">Lost Leads</h2>
            <span className="text-sm text-zinc-400">({lostLeads.length})</span>
          </div>

          {lostLeads.length === 0 ? (
            <div className="bg-white border border-zinc-200/60 rounded-2xl p-12 text-center">
              <p className="text-zinc-400">No lost leads yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lostLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => window.location.href = createPageUrl("LeadProfile") + `?id=${lead.id}`}
                  className="bg-white border border-red-200/60 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-sm text-zinc-900">{lead.business_name}</h3>
                    <div className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                      Lost
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-500">
                    {lead.contact_person && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {lead.contact_person}
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </div>
                    )}
                    {lead.project_price > 0 && (
                      <div className="flex items-center gap-1.5 text-red-600 font-medium">
                        <DollarSign className="w-3 h-3" />
                        ${lead.project_price.toLocaleString()} (lost)
                      </div>
                    )}
                    {lead.created_by && (
                      <div className="flex items-center gap-1.5 text-violet-600">
                        <User className="w-3 h-3" />
                        {lead.created_by.split('@')[0]}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Calendar className="w-3 h-3" />
                      Closed {format(new Date(lead.updated_date), "MMM d, yyyy")}
                    </div>
                  </div>

                  {lead.notes && (
                    <p className="text-xs text-zinc-400 mt-3 line-clamp-2">{lead.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}