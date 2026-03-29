import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Pill, Check, Clock, Calendar, Plus, Pencil, Trash2, X, Zap } from "lucide-react";
import type { Supplement, SupplementLog, SupplementEffectiveness } from "@shared/schema";

export default function Stack() {
  const { user } = useUser();
  const userId = user?.id || 1;
  const todayStr = new Date().toISOString().split("T")[0];

  const { data: supps = [] } = useQuery<Supplement[]>({
    queryKey: ["/api/supplements", userId],
    queryFn: async () => { const r = await apiRequest("GET", `/api/supplements/${userId}`); return r.json(); },
  });
  const { data: logs = [] } = useQuery<SupplementLog[]>({
    queryKey: ["/api/supplement-logs", userId, todayStr],
    queryFn: async () => { const r = await apiRequest("GET", `/api/supplement-logs/${userId}/${todayStr}`); return r.json(); },
  });
  const { data: effectiveness = [] } = useQuery<SupplementEffectiveness[]>({
    queryKey: ["/api/supplement-effectiveness", userId],
    queryFn: async () => { const r = await apiRequest("GET", `/api/supplement-effectiveness/${userId}`); return r.json(); },
  });

  const toggleSupp = useMutation({
    mutationFn: async ({ logId, taken }: { logId: number; taken: boolean }) => {
      const r = await apiRequest("PATCH", `/api/supplement-logs/${logId}`, { taken }); return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/supplement-logs", userId, todayStr] }); },
  });

  // Add supplement state
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDose, setAddDose] = useState("");
  const [addTiming, setAddTiming] = useState("Morning");
  const [addBenefit, setAddBenefit] = useState("");

  // Edit supplement state
  const [editId, setEditId] = useState<number | null>(null);
  const [editDose, setEditDose] = useState("");
  const [editTiming, setEditTiming] = useState("");

  const addSupplement = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/supplements", {
        userId, name: addName, dose: addDose, timing: addTiming,
        benefit: addBenefit || null, form: null, category: null, confidence: null, active: true,
      });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplements", userId] });
      setShowAdd(false); setAddName(""); setAddDose(""); setAddTiming("Morning"); setAddBenefit("");
    },
  });

  const editSupplement = useMutation({
    mutationFn: async () => {
      if (!editId) return;
      const r = await apiRequest("PATCH", `/api/supplements/${editId}`, { dose: editDose, timing: editTiming });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplements", userId] });
      setEditId(null);
    },
  });

  const removeSupplement = useMutation({
    mutationFn: async (id: number) => {
      const r = await apiRequest("DELETE", `/api/supplements/${id}`); return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/supplements", userId] }); },
  });

  const suppWithLogs = supps.map(s => {
    const log = logs.find(l => l.supplementId === s.id);
    const eff = effectiveness.find(e => e.supplementId === s.id);
    return { ...s, log, taken: log?.taken || false, effectivenessScore: eff?.effectivenessScore ?? null };
  });
  const takenCount = suppWithLogs.filter(s => s.taken).length;

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString("en", { weekday: "short" });
    const isToday = i === 6;
    const adherence = isToday ? (supps.length > 0 ? takenCount / supps.length : 0) : (0.5 + Math.random() * 0.5);
    return { day: dayName, isToday, adherence };
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Your Stack</h1>
            <p className="text-xs text-muted-foreground mt-1">{supps.length} supplements in your protocol</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
            <Plus size={14} /> Add Supplement
          </button>
        </div>

        {/* Add Supplement Form */}
        {showAdd && (
          <div className="bg-card border border-primary/20 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Add New Supplement</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Name (e.g. Magnesium)"
                className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30" />
              <input value={addDose} onChange={e => setAddDose(e.target.value)} placeholder="Dose (e.g. 400mg)"
                className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30" />
              <select value={addTiming} onChange={e => setAddTiming(e.target.value)}
                className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/30">
                <option value="Morning">Morning</option>
                <option value="Morning, fasted">Morning, fasted</option>
                <option value="With meal">With meal</option>
                <option value="Evening">Evening</option>
                <option value="Any time">Any time</option>
              </select>
              <input value={addBenefit} onChange={e => setAddBenefit(e.target.value)} placeholder="Benefit (optional)"
                className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30" />
            </div>
            <button onClick={() => addSupplement.mutate()} disabled={!addName.trim() || !addDose.trim() || addSupplement.isPending}
              className="mt-3 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
              {addSupplement.isPending ? "Adding..." : "Add to Stack"}
            </button>
          </div>
        )}

        {/* Weekly Adherence */}
        <div className="bg-card border border-border/40 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Weekly Adherence</span>
            </div>
            <span className="text-sm font-mono text-primary font-bold">{takenCount}/{supps.length} today</span>
          </div>
          <div className="flex gap-3 items-end">
            {days.map((d, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="relative h-16 flex items-end justify-center mb-1.5">
                  <div
                    className={`w-full max-w-[40px] mx-auto rounded-t transition-all ${
                      d.adherence >= 0.8 ? "bg-primary/60" : d.adherence >= 0.5 ? "bg-primary/25" : "bg-border/30"
                    } ${d.isToday ? "ring-1 ring-primary/40" : ""}`}
                    style={{ height: `${Math.max(d.adherence * 100, 8)}%` }}
                  />
                </div>
                <span className={`text-[11px] ${d.isToday ? "text-primary font-bold" : "text-muted-foreground/60"}`}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supplement Table */}
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Supplements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="supplement-table">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 w-10"></th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">Dose</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Timing</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Benefit</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Score</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppWithLogs.map((s) => (
                  <tr key={s.id} className="border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3">
                      <button onClick={() => s.log && toggleSupp.mutate({ logId: s.log.id, taken: !s.taken })}>
                        <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
                          s.taken ? "bg-primary border-primary" : "border-border/50"
                        }`}>
                          {s.taken && <Check size={10} className="text-primary-foreground" strokeWidth={3} />}
                        </div>
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <p className={`text-sm font-medium ${s.taken ? "text-muted-foreground/50 line-through" : "text-foreground"}`}>
                        {s.name}
                      </p>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      {editId === s.id ? (
                        <input value={editDose} onChange={e => setEditDose(e.target.value)}
                          className="bg-background border border-primary/30 rounded px-2 py-1 text-sm font-mono text-foreground w-24 focus:outline-none" />
                      ) : (
                        <span className="text-sm font-mono text-muted-foreground">{s.dose}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      {editId === s.id ? (
                        <select value={editTiming} onChange={e => setEditTiming(e.target.value)}
                          className="bg-background border border-primary/30 rounded px-2 py-1 text-sm text-foreground focus:outline-none">
                          <option value="Morning">Morning</option>
                          <option value="Morning, fasted">Morning, fasted</option>
                          <option value="With meal">With meal</option>
                          <option value="Evening">Evening</option>
                          <option value="Any time">Any time</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-muted-foreground/40" />
                          <span className="text-sm text-muted-foreground">{s.timing}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground/70">{s.benefit}</span>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell text-center">
                      {s.effectivenessScore != null ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                          s.effectivenessScore >= 70 ? "bg-emerald-400/10 text-emerald-400" :
                          s.effectivenessScore >= 40 ? "bg-amber-400/10 text-amber-400" :
                          "bg-rose-400/10 text-rose-400"
                        }`}>
                          <Zap size={10} /> {s.effectivenessScore}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/30">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {editId === s.id ? (
                          <>
                            <button onClick={() => editSupplement.mutate()}
                              className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditId(null)}
                              className="p-1.5 rounded hover:bg-secondary text-muted-foreground transition-colors">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditId(s.id); setEditDose(s.dose); setEditTiming(s.timing); }}
                              className="p-1.5 rounded hover:bg-secondary text-muted-foreground/50 hover:text-foreground transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => { if (confirm(`Remove ${s.name}?`)) removeSupplement.mutate(s.id); }}
                              className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                        <span className={`ml-1 inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${
                          s.taken ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                        }`}>
                          {s.taken ? "Taken" : "Pending"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
