import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest, queryClient } from "../lib/queryClient";
import { TestTube2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Biomarker } from "@shared/schema";

const BIOMARKER_PRESETS: { name: string; unit: string; refMin: number; refMax: number; optMin: number; optMax: number }[] = [
  { name: "cortisol", unit: "μg/dL", refMin: 6, refMax: 18, optMin: 8, optMax: 14 },
  { name: "vitamin_d", unit: "ng/mL", refMin: 20, refMax: 100, optMin: 40, optMax: 80 },
  { name: "hs_crp", unit: "mg/L", refMin: 0, refMax: 3, optMin: 0, optMax: 1 },
  { name: "hba1c", unit: "%", refMin: 4, refMax: 5.7, optMin: 4.5, optMax: 5.3 },
  { name: "testosterone", unit: "ng/dL", refMin: 300, refMax: 1000, optMin: 500, optMax: 900 },
  { name: "total_cholesterol", unit: "mg/dL", refMin: 125, refMax: 200, optMin: 150, optMax: 190 },
  { name: "ldl", unit: "mg/dL", refMin: 0, refMax: 100, optMin: 50, optMax: 90 },
  { name: "hdl", unit: "mg/dL", refMin: 40, refMax: 100, optMin: 50, optMax: 80 },
  { name: "triglycerides", unit: "mg/dL", refMin: 0, refMax: 150, optMin: 40, optMax: 100 },
  { name: "tsh", unit: "mIU/L", refMin: 0.4, refMax: 4.0, optMin: 1.0, optMax: 2.5 },
  { name: "ferritin", unit: "ng/mL", refMin: 20, refMax: 200, optMin: 40, optMax: 150 },
  { name: "b12", unit: "pg/mL", refMin: 200, refMax: 900, optMin: 400, optMax: 800 },
  { name: "folate", unit: "ng/mL", refMin: 2.7, refMax: 17, optMin: 8, optMax: 15 },
  { name: "magnesium", unit: "mg/dL", refMin: 1.7, refMax: 2.2, optMin: 2.0, optMax: 2.2 },
  { name: "omega3_index", unit: "%", refMin: 4, refMax: 12, optMin: 8, optMax: 12 },
];

function formatName(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace("Hs Crp", "hs-CRP").replace("Hba1c", "HbA1c").replace("Ldl", "LDL").replace("Hdl", "HDL").replace("Tsh", "TSH").replace("B12", "B12").replace("Omega3 Index", "Omega-3 Index");
}

function calcStatus(value: number, preset: typeof BIOMARKER_PRESETS[0]): string {
  if (value >= preset.optMin && value <= preset.optMax) return "optimal";
  if (value >= preset.refMin && value <= preset.refMax) return "normal";
  if (value < preset.refMin) return "low";
  if (value > preset.refMax) return "high";
  return "normal";
}

function statusBadge(status: string | null) {
  const styles: Record<string, string> = {
    optimal: "bg-emerald-400/10 text-emerald-400",
    normal: "bg-blue-400/10 text-blue-400",
    low: "bg-amber-400/10 text-amber-400",
    high: "bg-rose-400/10 text-rose-400",
    critical: "bg-rose-500/20 text-rose-500",
  };
  return styles[status || "normal"] || styles.normal;
}

export default function Biomarkers() {
  const { user } = useUser();
  const userId = user?.id || 1;
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [value, setValue] = useState("");
  const [date, setDate] = useState(todayStr);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const preset = BIOMARKER_PRESETS[selectedPreset];

  const { data: allBiomarkers = [] } = useQuery<Biomarker[]>({
    queryKey: ["/api/biomarkers", userId],
    queryFn: async () => { const r = await apiRequest("GET", `/api/biomarkers/${userId}`); return r.json(); },
  });

  const saveBiomarker = useMutation({
    mutationFn: async () => {
      const numVal = parseFloat(value);
      if (isNaN(numVal)) throw new Error("Invalid value");
      const status = calcStatus(numVal, preset);
      const r = await apiRequest("POST", "/api/biomarkers", {
        userId, date, name: preset.name, value: numVal, unit: preset.unit,
        referenceMin: preset.refMin, referenceMax: preset.refMax,
        status, notes: notes.trim() || null,
      });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/biomarkers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scores"] });
      setValue("");
      setNotes("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  // Group biomarkers by date for display
  const grouped = allBiomarkers.reduce<Record<string, Biomarker[]>>((acc, b) => {
    if (!acc[b.date]) acc[b.date] = [];
    acc[b.date].push(b);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Get trend for a biomarker (compare latest two entries of same name)
  function getTrend(biomarker: Biomarker) {
    const history = allBiomarkers.filter(b => b.name === biomarker.name).sort((a, b) => b.date.localeCompare(a.date));
    if (history.length < 2) return null;
    const diff = history[0].value - history[1].value;
    if (Math.abs(diff) < 0.01) return "stable";
    return diff > 0 ? "up" : "down";
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <TestTube2 size={18} className="text-primary" />
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Biomarkers</h1>
          </div>
          <p className="text-xs text-muted-foreground">Enter lab results to track your biomarker health</p>
        </div>

        {/* Add Biomarker Form */}
        <div className="bg-card border border-border/40 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Add Biomarker Result</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Biomarker</label>
              <select value={selectedPreset} onChange={e => setSelectedPreset(parseInt(e.target.value))}
                className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/30">
                {BIOMARKER_PRESETS.map((p, i) => (
                  <option key={p.name} value={i}>{formatName(p.name)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Value ({preset.unit})</label>
              <input type="number" step="0.1" value={value} onChange={e => setValue(e.target.value)}
                placeholder={`${preset.optMin}–${preset.optMax}`}
                className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/30" />
            </div>
          </div>

          {/* Reference range display */}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span>Reference: {preset.refMin}–{preset.refMax} {preset.unit}</span>
            <span className="text-emerald-400">Optimal: {preset.optMin}–{preset.optMax} {preset.unit}</span>
            {value && !isNaN(parseFloat(value)) && (
              <span className={`font-semibold ${statusBadge(calcStatus(parseFloat(value), preset)).replace("bg-", "").split(" ")[1]}`}>
                Status: {calcStatus(parseFloat(value), preset)}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-3">
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"
              className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30" />
            <button onClick={() => saveBiomarker.mutate()}
              disabled={!value || saveBiomarker.isPending}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"}`}>
              {saveBiomarker.isPending ? "Saving..." : saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Biomarker History */}
        {sortedDates.length > 0 && (
          <div className="bg-card border border-border/40 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Biomarker History</h2>
            <div className="space-y-4">
              {sortedDates.map(dateKey => (
                <div key={dateKey}>
                  <p className="text-xs text-muted-foreground font-mono mb-2">{dateKey}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {grouped[dateKey].map(b => {
                      const trend = getTrend(b);
                      return (
                        <div key={b.id} className="flex items-center gap-3 bg-background/50 border border-border/20 rounded-lg px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{formatName(b.name)}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-mono font-semibold text-foreground">{b.value}</span>
                              <span className="text-[10px] text-muted-foreground">{b.unit}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {trend === "up" && <TrendingUp size={12} className="text-muted-foreground" />}
                            {trend === "down" && <TrendingDown size={12} className="text-muted-foreground" />}
                            {trend === "stable" && <Minus size={12} className="text-muted-foreground" />}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${statusBadge(b.status)}`}>
                              {b.status || "normal"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
