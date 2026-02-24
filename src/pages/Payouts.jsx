import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Calendar, Pencil, Calculator } from "lucide-react";
import PageTransition from "../components/layout/PageTransition";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CalculatorDialog from "../components/calculator/CalculatorDialog";

export default function Payouts() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentUser, setCurrentUser] = useState(null);
  const [editingPayout, setEditingPayout] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => {});
  }, []);

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list(),
    initialData: []
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  // Filter won leads
  const wonLeads = leads.filter((l) => l.status === "closed_won" && l.updated_date);

  // Get available fiscal years
  const fiscalYears = [...new Set(wonLeads.map((l) => {
    const date = new Date(l.updated_date);
    return date.getFullYear();
  }))].sort((a, b) => b - a);

  if (!fiscalYears.includes(selectedYear) && fiscalYears.length > 0) {
    setSelectedYear(fiscalYears[0]);
  }

  // Filter leads by fiscal year
  const yearLeads = wonLeads.filter((l) => {
    const date = new Date(l.updated_date);
    return date.getFullYear() === selectedYear;
  });

  // Calculate payouts
  const calculatePayouts = () => {
    const payouts = {};

    // Track users with ec_rep role or admin
    const eligibleUsers = users.filter(u => u.role === 'ec_rep' || u.role === 'admin');
    eligibleUsers.forEach((user) => {
      const firstName = user.full_name?.split(' ')[0] || user.full_name;
      payouts[firstName] = { base: 0, commission: 0, total: 0, leads: [], email: user.email, fullName: user.full_name };
    });

    yearLeads.forEach((lead) => {
      const price = lead.project_price || 0;

      // Base 45% EACH for Braden and Taylor on ALL closed won leads
      if (payouts.Braden) {
        payouts.Braden.base += price * 0.45;
      }
      if (payouts.Taylor) {
        payouts.Taylor.base += price * 0.45;
      }

      // 10% commission based on call_made_by field
      const callMadeBy = lead.call_made_by;
      if (callMadeBy) {
        const firstName = callMadeBy.split(' ')[0];
        if (payouts[firstName]) {
          payouts[firstName].commission += price * 0.10;
        }
      }

      // Track leads for each person who gets a commission
      Object.keys(payouts).forEach((firstName) => {
        const hasCommission = callMadeBy && callMadeBy.split(' ')[0] === firstName;
        const hasBase = firstName === 'Braden' || firstName === 'Taylor';

        if (hasCommission || hasBase) {
          payouts[firstName].leads.push({ ...lead, hasCallCommission: hasCommission });
        }
      });
    });

    // Calculate totals
    Object.keys(payouts).forEach((firstName) => {
      payouts[firstName].total = payouts[firstName].base + payouts[firstName].commission;
    });

    return payouts;
  };

  const payouts = calculatePayouts();
  const totalRevenue = yearLeads.reduce((sum, l) => sum + (l.project_price || 0), 0);
  const canEdit = currentUser?.role === 'admin';
  
  // Filter payouts based on user role
  const visiblePayouts = currentUser?.role === 'admin' 
    ? payouts 
    : currentUser 
      ? Object.fromEntries(
          Object.entries(payouts).filter(([name, data]) => 
            data.email === currentUser.email
          )
        )
      : {};

  return (
    <PageTransition>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Payouts</h1>
            <p className="text-sm text-zinc-400 mt-1">Commission payouts by fiscal year</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => setShowCalculator(true)}
              variant="outline"
              size="icon"
              className="rounded-xl"
            >
              <Calculator className="w-4 h-4" />
            </Button>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((year) =>
                <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Revenue</p>
              <p className="text-2xl font-bold text-zinc-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Leads Won</p>
              <p className="text-2xl font-bold text-zinc-900">{yearLeads.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Fiscal Year</p>
              <p className="text-2xl font-bold text-zinc-900">{selectedYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(visiblePayouts).map(([name, data]) =>
        <div key={name} className="bg-white border border-zinc-200/60 rounded-2xl p-6 group">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">{name}</h3>
            
            <div className="space-y-3 mb-6">
              {data.base > 0 &&
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-600">Base Commission (45%)</span>
                  {canEdit && editingPayout === `${name}-base` ? (
                    <Input 
                      type="number"
                      className="w-32 h-7 text-sm"
                      defaultValue={data.base.toFixed(2)}
                      onBlur={() => setEditingPayout(null)}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900">${data.base.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      {canEdit && (
                        <button onClick={() => setEditingPayout(`${name}-base`)} className="opacity-0 group-hover:opacity-100">
                          <Pencil className="w-3 h-3 text-zinc-400" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
            }
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <span className="text-sm text-zinc-600">Call Commission (10%)</span>
                {canEdit && editingPayout === `${name}-commission` ? (
                  <Input 
                    type="number"
                    className="w-32 h-7 text-sm"
                    defaultValue={data.commission.toFixed(2)}
                    onBlur={() => setEditingPayout(null)}
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900">${data.commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {canEdit && (
                      <button onClick={() => setEditingPayout(`${name}-commission`)} className="opacity-0 group-hover:opacity-100">
                        <Pencil className="w-3 h-3 text-zinc-400" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-semibold text-zinc-900">Total Payout</span>
                <span className="text-2xl font-bold text-emerald-600">${data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {data.leads.length > 0 &&
          <>
                <div className="text-xs text-zinc-500 mb-2">Leads ({data.leads.length})</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.leads.map((lead) =>
              <div key={lead.id} className="bg-zinc-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-zinc-900">{lead.business_name}</span>
                        {lead.hasCallCommission &&
                  <span className="bg-slate-700 text-sky-400 px-2 py-0.5 text-xs rounded">Call Made</span>
                  }
                      </div>
                      <div className="text-xs text-zinc-500">${(lead.project_price || 0).toLocaleString()}</div>
                    </div>
              )}
                </div>
              </>
          }
          </div>
        )}
      </div>

      <CalculatorDialog
        open={showCalculator}
        onOpenChange={setShowCalculator}
      />
    </PageTransition>);

}