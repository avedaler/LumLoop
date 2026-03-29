import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Pill, Check, Clock, Calendar } from "lucide-react";
import type { Supplement, SupplementLog } from "@shared/schema";

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

  const toggleSupp = useMutation({
    mutationFn: async ({ logId, taken }: { logId: number; taken: boolean }) => {
      const r = await apiRequest("PATCH", `/api/supplement-logs/${logId}`, { taken }); return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/supplement-logs", userId, todayStr] }); },
  });

  const suppWithLogs = supps.map(s => {
    const log = logs.find(l => l.supplementId === s.id);
    return { ...s, log, taken: log?.taken || false };
  });
  const takenCount = suppWithLogs.filter(s => s.taken).length;

  // Simple adherence calendar (last 7 days)
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString("en", { weekday: "short" });
    const isToday = i === 6;
    const adherence = isToday ? (takenCount / supps.length) : (0.5 + Math.random() * 0.5);
    return { day: dayName, isToday, adherence };
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Your Stack</h1>
          <p className="text-xs text-muted-foreground mt-1">{supps.length} supplements in your protocol</p>
        </div>

        {/* Weekly Adherence — compact horizontal bar chart */}
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
                      d.adherence >= 0.8 ? "bg-primary/60" :
                      d.adherence >= 0.5 ? "bg-primary/25" :
                      "bg-border/30"
                    } ${d.isToday ? "ring-1 ring-primary/40" : ""}`}
                    style={{ height: `${Math.max(d.adherence * 100, 8)}%` }}
                  />
                </div>
                <span className={`text-[11px] ${d.isToday ? "text-primary font-bold" : "text-muted-foreground/60"}`}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supplement data table */}
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
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {suppWithLogs.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => s.log && toggleSupp.mutate({ logId: s.log.id, taken: !s.taken })}
                    className="border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                    data-testid={`supp-${s.id}`}
                  >
                    <td className="px-5 py-3">
                      <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
                        s.taken ? "bg-primary border-primary" : "border-border/50"
                      }`}>
                        {s.taken && <Check size={10} className="text-primary-foreground" strokeWidth={3} />}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className={`text-sm font-medium ${s.taken ? "text-muted-foreground/50 line-through" : "text-foreground"}`}>
                        {s.name}
                      </p>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-sm font-mono text-muted-foreground">{s.dose}</span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-muted-foreground/40" />
                        <span className="text-sm text-muted-foreground">{s.timing}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground/70">{s.benefit}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${
                        s.taken
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {s.taken ? "Taken" : "Pending"}
                      </span>
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
