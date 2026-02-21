import React from "react";
import { DollarSign, User, Award } from "lucide-react";
import PageTransition from "../components/layout/PageTransition";

export default function Commissions() {
  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Commission Structure</h1>
        <p className="text-sm text-zinc-400 mt-1">How commissions are calculated and distributed</p>
      </div>

      <div className="space-y-6">
        {/* Call/Lead Commission */}
        <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-stone-600 rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0">
              <DollarSign className="text-sky-500 lucide lucide-dollar-sign w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Call Made / Lead Provided</h3>
              <p className="text-sm text-zinc-600 mb-3">
                When a call is made or a lead is provided, the person responsible receives an immediate commission.
              </p>
              <div className="bg-stone-600 p-4 rounded-xl border border-violet-200">
                <p className="text-sky-500 text-2xl font-bold">10%</p>
                <p className="text-sky-400 text-sm">of project price collected by company</p>
              </div>
            </div>
          </div>
        </div>

        {/* Base Commission for Braden & Taylor */}
        <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-stone-700 rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0">
              <User className="text-sky-500 lucide lucide-user w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Base Commission (Braden & Taylor)</h3>
              <p className="text-sm text-zinc-600 mb-3">
                Braden and Taylor each receive a base commission on every project.
              </p>
              <div className="bg-stone-700 p-4 rounded-xl border border-emerald-200">
                <p className="text-sky-500 text-2xl font-bold">45%</p>
                <p className="text-sky-500 text-sm">of project price collected by company (each)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Commission */}
        <div className="bg-white border border-zinc-200/60 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-stone-800 rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0">
              <Award className="text-sky-500 lucide lucide-award w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Combined Commission (Braden & Taylor)</h3>
              <p className="text-sm text-zinc-600 mb-3">
                If Braden or Taylor makes the call or is assigned to the lead as EC Rep, they receive both commissions.
              </p>
              <div className="bg-stone-800 p-4 rounded-xl border border-amber-200">
                <p className="text-sky-500 text-2xl font-bold">55%</p>
                <p className="text-sky-500 text-sm">45% base + 10% call/lead commission</p>
              </div>
            </div>
          </div>
        </div>

        {/* EC Tech Note */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-2">EC Tech Assignment</h3>
          <p className="text-sm text-zinc-600">
            Each lead should have a dedicated EC Tech (Braden or Taylor) assigned. The EC Tech is responsible for deploying and building the site. This is tracked in the lead details under "Dedicated EC Tech".
          </p>
        </div>
      </div>
    </PageTransition>);

}