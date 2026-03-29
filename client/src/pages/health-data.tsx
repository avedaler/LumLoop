import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Activity, Moon, Heart, Scale, Thermometer, Upload, Check } from "lucide-react";
import type { HealthMetric } from "@shared/schema";

export default function HealthData() {
  const { user } = useUser();
  const userId = user?.id || 1;
  const todayStr = new Date().toISOString().split("T")[0];

  // Today's metric
  const { data: todayMetric } = useQuery<HealthMetric | null>({
    queryKey: ["/api/health-metrics", userId, todayStr],
    queryFn: async () => { const r = await apiRequest("GET", `/api/health-metrics/${userId}/${todayStr}`); return r.json(); },
  });

  // Recent entries
  const { data: recentMetrics = [] } = useQuery<HealthMetric[]>({
    queryKey: ["/api/health-metrics", userId],
    queryFn: async () => { const r = await apiRequest("GET", `/api/health-metrics/${userId}?limit=7`); return r.json(); },
  });

  // Sleep card state
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState(3);
  // Heart card state
  const [hrv, setHrv] = useState("");
  const [restingHR, setRestingHR] = useState("");
  // Body card state
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  // Vitals card state
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [oxygenSat, setOxygenSat] = useState("");
  const [steps, setSteps] = useState("");

  const [savedCard, setSavedCard] = useState<string | null>(null);

  const saveMetric = useMutation({
    mutationFn: async (fields: Record<string, any>) => {
      const r = await apiRequest("POST", "/api/health-metrics", {
        userId, date: todayStr, ...fields,
      });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scores"] });
    },
  });

  function saveCard(card: string, fields: Record<string, any>) {
    saveMetric.mutate(fields);
    setSavedCard(card);
    setTimeout(() => setSavedCard(null), 2000);
  }

  // Apple Health import
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number } | null>(null);

  async function handleAppleHealthFile(file: File) {
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const records = parseAppleHealthXML(text);
      const r = await apiRequest("POST", "/api/import/apple-health", { userId, records });
      const result = await r.json();
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/health-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scores"] });
    } catch (e) {
      setImportResult({ imported: 0 });
    }
    setImporting(false);
  }

  // 7-day averages for color coding
  const avg = (arr: (number | null | undefined)[]) => {
    const valid = arr.filter((v): v is number => v != null);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };
  const avgSleep = avg(recentMetrics.map(m => m.sleepHours));
  const avgHrv = avg(recentMetrics.map(m => m.hrv));
  const avgHR = avg(recentMetrics.map(m => m.restingHR));
  const avgWeight = avg(recentMetrics.map(m => m.weight));
  const avgSteps = avg(recentMetrics.map(m => m.steps));

  function trendColor(val: number | null | undefined, average: number | null, higherIsBetter = true) {
    if (val == null || average == null) return "text-foreground";
    const diff = val - average;
    if (Math.abs(diff) < average * 0.02) return "text-foreground";
    const improving = higherIsBetter ? diff > 0 : diff < 0;
    return improving ? "text-emerald-400" : "text-rose-400";
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={18} className="text-primary" />
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Log Health Data</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} — Enter today's metrics
          </p>
        </div>

        {todayMetric && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-6 text-center">
            <p className="text-sm text-primary font-medium">Today's data already recorded — submitting again will create a new entry</p>
          </div>
        )}

        {/* Quick Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Sleep Card */}
          <div className="bg-card border border-border/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Moon size={14} className="text-blue-400" />
              <span className="text-sm font-semibold text-foreground">Sleep</span>
              {savedCard === "sleep" && <Check size={14} className="text-emerald-400 ml-auto" />}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Hours</label>
                <input type="number" step="0.5" min="0" max="24" value={sleepHours} onChange={e => setSleepHours(e.target.value)}
                  placeholder="7.5" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Quality (1-5)</label>
                <div className="flex gap-1.5 mt-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setSleepQuality(n)}
                      className={`flex-1 h-8 rounded text-xs font-mono font-semibold transition-all ${n <= sleepQuality ? "bg-blue-400 text-white" : "bg-border/30 text-muted-foreground hover:bg-border/50"}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => saveCard("sleep", { sleepHours: parseFloat(sleepHours) || null, sleepQuality })}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all">
                Save Sleep
              </button>
            </div>
          </div>

          {/* Heart Card */}
          <div className="bg-card border border-border/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={14} className="text-rose-400" />
              <span className="text-sm font-semibold text-foreground">Heart</span>
              {savedCard === "heart" && <Check size={14} className="text-emerald-400 ml-auto" />}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">HRV (ms)</label>
                <input type="number" min="0" max="300" value={hrv} onChange={e => setHrv(e.target.value)}
                  placeholder="65" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Resting HR (bpm)</label>
                <input type="number" min="30" max="200" value={restingHR} onChange={e => setRestingHR(e.target.value)}
                  placeholder="58" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 mt-1" />
              </div>
              <button onClick={() => saveCard("heart", { hrv: parseInt(hrv) || null, restingHR: parseInt(restingHR) || null })}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all">
                Save Heart
              </button>
            </div>
          </div>

          {/* Body Card */}
          <div className="bg-card border border-border/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Scale size={14} className="text-amber-400" />
              <span className="text-sm font-semibold text-foreground">Body</span>
              {savedCard === "body" && <Check size={14} className="text-emerald-400 ml-auto" />}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Weight (kg)</label>
                <input type="number" step="0.1" min="20" max="300" value={weight} onChange={e => setWeight(e.target.value)}
                  placeholder="75.0" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Body Fat %</label>
                <input type="number" step="0.1" min="1" max="60" value={bodyFat} onChange={e => setBodyFat(e.target.value)}
                  placeholder="18.5" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 mt-1" />
              </div>
              <button onClick={() => saveCard("body", { weight: parseFloat(weight) || null, bodyFat: parseFloat(bodyFat) || null })}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all">
                Save Body
              </button>
            </div>
          </div>

          {/* Vitals Card */}
          <div className="bg-card border border-border/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer size={14} className="text-emerald-400" />
              <span className="text-sm font-semibold text-foreground">Vitals</span>
              {savedCard === "vitals" && <Check size={14} className="text-emerald-400 ml-auto" />}
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">BP Sys</label>
                  <input type="number" min="60" max="250" value={bpSys} onChange={e => setBpSys(e.target.value)}
                    placeholder="120" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">BP Dia</label>
                  <input type="number" min="30" max="150" value={bpDia} onChange={e => setBpDia(e.target.value)}
                    placeholder="80" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 mt-1" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">O2 %</label>
                  <input type="number" min="80" max="100" value={oxygenSat} onChange={e => setOxygenSat(e.target.value)}
                    placeholder="98" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Steps</label>
                  <input type="number" min="0" max="100000" value={steps} onChange={e => setSteps(e.target.value)}
                    placeholder="8000" className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 mt-1" />
                </div>
              </div>
              <button onClick={() => saveCard("vitals", {
                bloodPressureSys: parseInt(bpSys) || null, bloodPressureDia: parseInt(bpDia) || null,
                oxygenSat: parseInt(oxygenSat) || null, steps: parseInt(steps) || null,
              })}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all">
                Save Vitals
              </button>
            </div>
          </div>
        </div>

        {/* Recent Entries Table */}
        {recentMetrics.length > 0 && (
          <div className="bg-card border border-border/40 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Recent Entries</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium">Date</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Sleep</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">HRV</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">HR</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Weight</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Steps</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMetrics.map(m => (
                    <tr key={m.id} className="border-b border-border/15">
                      <td className="py-2 px-2 font-mono text-foreground">{m.date}</td>
                      <td className={`py-2 px-2 text-right font-mono ${trendColor(m.sleepHours, avgSleep, true)}`}>
                        {m.sleepHours != null ? `${m.sleepHours}h` : "—"}
                      </td>
                      <td className={`py-2 px-2 text-right font-mono ${trendColor(m.hrv, avgHrv, true)}`}>
                        {m.hrv != null ? `${m.hrv}ms` : "—"}
                      </td>
                      <td className={`py-2 px-2 text-right font-mono ${trendColor(m.restingHR, avgHR, false)}`}>
                        {m.restingHR != null ? `${m.restingHR}` : "—"}
                      </td>
                      <td className={`py-2 px-2 text-right font-mono ${trendColor(m.weight, avgWeight, false)}`}>
                        {m.weight != null ? `${m.weight}kg` : "—"}
                      </td>
                      <td className={`py-2 px-2 text-right font-mono ${trendColor(m.steps, avgSteps, true)}`}>
                        {m.steps != null ? m.steps.toLocaleString() : "—"}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.source === "apple_health" ? "bg-blue-400/10 text-blue-400" : "bg-muted text-muted-foreground"}`}>
                          {m.source || "manual"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Apple Health Import */}
        <div className="bg-card border border-border/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Upload size={14} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Import from Apple Health</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Export from iPhone: Health app → Profile → Export All Health Data → upload the export.xml here
          </p>
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
              <Upload size={24} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                {importing ? "Processing..." : "Click to upload export.xml"}
              </p>
              <input type="file" accept=".xml" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleAppleHealthFile(f); }}
                disabled={importing} />
            </div>
          </label>
          {importResult && (
            <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center">
              <p className="text-sm text-primary font-medium">
                {importResult.imported > 0 ? `Imported ${importResult.imported} days of health data` : "No new records to import"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Client-side Apple Health XML parser — extracts relevant records
function parseAppleHealthXML(xml: string): { date: string; sleepHours?: number; hrv?: number; restingHR?: number; steps?: number; weight?: number }[] {
  const dateMap: Map<string, { sleepHours?: number; hrv?: number; restingHR?: number; steps?: number; weight?: number }> = new Map();

  // Parse using regex for performance on large files
  const recordRegex = /<Record\s+[^>]*type="([^"]*)"[^>]*startDate="([^"]*)"[^>]*value="([^"]*)"[^>]*\/?>/g;
  let match;

  while ((match = recordRegex.exec(xml)) !== null) {
    const [, type, startDate, value] = match;
    const date = startDate.substring(0, 10); // YYYY-MM-DD
    const numVal = parseFloat(value);
    if (isNaN(numVal)) continue;

    if (!dateMap.has(date)) dateMap.set(date, {});
    const entry = dateMap.get(date)!;

    switch (type) {
      case "HKQuantityTypeIdentifierHeartRateVariabilitySDNN":
        entry.hrv = Math.round(numVal);
        break;
      case "HKQuantityTypeIdentifierRestingHeartRate":
        entry.restingHR = Math.round(numVal);
        break;
      case "HKQuantityTypeIdentifierStepCount":
        entry.steps = (entry.steps || 0) + Math.round(numVal);
        break;
      case "HKQuantityTypeIdentifierBodyMass":
        entry.weight = Math.round(numVal * 10) / 10;
        break;
    }
  }

  // Parse sleep separately (different structure)
  const sleepRegex = /<Record\s+[^>]*type="HKCategoryTypeIdentifierSleepAnalysis"[^>]*startDate="([^"]*)"[^>]*endDate="([^"]*)"[^>]*\/?>/g;
  while ((match = sleepRegex.exec(xml)) !== null) {
    const [, startDate, endDate] = match;
    const date = startDate.substring(0, 10);
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const hours = Math.round(((end - start) / 3600000) * 10) / 10;
    if (hours > 0 && hours < 24) {
      if (!dateMap.has(date)) dateMap.set(date, {});
      const entry = dateMap.get(date)!;
      entry.sleepHours = (entry.sleepHours || 0) + hours;
    }
  }

  // Cap sleep hours at reasonable max
  for (const entry of dateMap.values()) {
    if (entry.sleepHours && entry.sleepHours > 14) entry.sleepHours = 14;
  }

  return Array.from(dateMap.entries()).map(([date, data]) => ({ date, ...data }));
}
