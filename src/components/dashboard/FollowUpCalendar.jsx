import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { Phone, Calendar as CalendarIcon } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function FollowUpCalendar({ leads }) {
  const [selectedDate, setSelectedDate] = useState(null);

  // Get leads with follow-ups
  const leadsWithFollowUps = leads.filter(l => l.next_follow_up);

  // Group leads by follow-up date
  const followUpsByDate = leadsWithFollowUps.reduce((acc, lead) => {
    const date = lead.next_follow_up;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(lead);
    return acc;
  }, {});

  // Get dates that have follow-ups
  const followUpDates = Object.keys(followUpsByDate).map(d => new Date(d));

  // Check if a date has follow-ups
  const hasFollowUp = (date) => {
    return followUpDates.some(d => isSameDay(d, date));
  };

  // Get leads for selected date
  const selectedDateLeads = selectedDate 
    ? followUpsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  return (
    <div className="bg-white border border-zinc-200/60 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-4 h-4 text-violet-600" />
        <h3 className="text-sm font-semibold text-zinc-900">Follow-Up Calendar</h3>
        {followUpDates.length > 0 && (
          <span className="text-xs text-zinc-400 ml-auto">
            {followUpDates.length} upcoming
          </span>
        )}
      </div>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-lg"
        modifiers={{
          followUp: followUpDates,
        }}
        modifiersStyles={{
          followUp: {
            position: 'relative',
          }
        }}
        modifiersClassNames={{
          followUp: 'relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-violet-600 after:rounded-full',
        }}
      />

      {selectedDate && selectedDateLeads.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-200/60">
          <p className="text-xs font-semibold text-zinc-900 mb-3">
            {format(selectedDate, 'MMMM d, yyyy')} • {selectedDateLeads.length} lead{selectedDateLeads.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedDateLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => window.location.href = createPageUrl("LeadProfile") + `?id=${lead.id}`}
                className="p-3 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200/60 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {lead.business_name}
                    </p>
                    {lead.contact_person && (
                      <p className="text-xs text-zinc-500 mt-0.5">{lead.contact_person}</p>
                    )}
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-1 text-xs text-violet-600">
                      <Phone className="w-3 h-3" />
                      <span className="hidden sm:inline">{lead.phone}</span>
                    </div>
                  )}
                </div>
                {lead.notes && (
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{lead.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedDateLeads.length === 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-200/60">
          <p className="text-xs text-zinc-400 text-center py-4">
            No follow-ups scheduled for {format(selectedDate, 'MMM d')}
          </p>
        </div>
      )}
    </div>
  );
}