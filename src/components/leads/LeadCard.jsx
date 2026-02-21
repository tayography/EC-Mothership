import React from "react";
import { motion } from "framer-motion";
import { Phone, Clock, DollarSign, User, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function LeadCard({ lead, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className="bg-white border border-zinc-200/60 rounded-xl p-4 hover:shadow-lg hover:border-zinc-300 transition-all cursor-pointer group"
    >
      <h3 className="font-semibold text-sm text-zinc-900 mb-2 group-hover:text-violet-600 transition-colors">
        {lead.business_name}
      </h3>
      
      <div className="space-y-1.5 text-xs text-zinc-500">
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
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <DollarSign className="w-3 h-3" />
            ${lead.project_price.toLocaleString()}
          </div>
        )}
        {lead.total_hours > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {lead.total_hours.toFixed(1)}h
          </div>
        )}
        {lead.next_follow_up && (
          <div className="flex items-center gap-1.5 text-amber-600">
            <Calendar className="w-3 h-3" />
            {format(new Date(lead.next_follow_up), "MMM d")}
          </div>
        )}
      </div>

      {lead.notes && (
        <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{lead.notes}</p>
      )}
    </motion.div>
  );
}