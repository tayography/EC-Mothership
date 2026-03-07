import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CallCounter({ wonLeadsCount }) {
  const [callCount, setCallCount] = useState(0);
  const [metricId, setMetricId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Metric.filter({ name: "call_counter" }).then((results) => {
      if (results.length > 0) {
        setCallCount(results[0].value || 0);
        setMetricId(results[0].id);
      }
      setLoading(false);
    });
  }, []);

  const updateCount = async (newCount) => {
    if (newCount < 0) return;
    setCallCount(newCount);
    if (metricId) {
      await base44.entities.Metric.update(metricId, { value: newCount });
    } else {
      const created = await base44.entities.Metric.create({ name: "call_counter", value: newCount, unit: "number" });
      setMetricId(created.id);
    }
  };

  const closeRate = callCount > 0 ? ((wonLeadsCount / callCount) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 hover:shadow-lg hover:shadow-zinc-900/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-50 ring-1 ring-violet-100 flex items-center justify-center">
          <Phone className="w-5 h-5 text-violet-500" />
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-400">Close Rate</span>
          <p className="text-lg font-bold text-emerald-600">{closeRate}%</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 rounded-lg"
          onClick={() => updateCount(callCount - 1)}
          disabled={loading}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="text-2xl font-semibold tracking-tight text-zinc-900 min-w-[3ch] text-center">
          {loading ? "—" : callCount}
        </span>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 rounded-lg"
          onClick={() => updateCount(callCount + 1)}
          disabled={loading}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <p className="text-xs text-zinc-400">Call Counter</p>
    </div>
  );
}