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
    const dayName = d.toLocaleDateString("en", { weekday: "short" }).charAt(0);
    const isToday = i === 6;
    // Mock: past days have varying adherence
    const adherence = isToday ? (takenCount / supps.length) : (0.5 + Math.random() * 0.5);
    return { day: dayName, isToday, adherence };
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-14 pb-2">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Your Stack</h1>
        <p className="text-[10px] text-muted-foreground mt-0.5">{supps.length} supplements in your protocol</p>
      </header>

      <div className="px-5 pb-8">
        {/* Adherence summary */}
        <div className="bg-card border border-border/40 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-primary" />
              <span className="text-[11px] font-semibold text-foreground">Weekly Adherence</span>
            </div>
            <span className="text-[11px] font-mono text-primary font-bold">{takenCount}/{supps.length} today</span>
          </div>
          <div className="flex gap-1.5">
            {days.map((d, i) => (
              <div key={i} className="flex-1 text-center">
                <div
                  className={`w-full aspect-square rounded-lg mb-1 transition-all ${
                    d.adherence >= 0.8 ? "bg-primary/60" :
                    d.adherence >= 0.5 ? "bg-primary/25" :
                    "bg-border/30"
                  } ${d.isToday ? "ring-1 ring-primary/40" : ""}`}
                />
                <span className={`text-[8px] ${d.isToday ? "text-primary font-bold" : "text-muted-foreground/50"}`}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supplement list — simplified */}
        <div className="space-y-2">
          {suppWithLogs.map((s) => (
            <button
              key={s.id}
              onClick={() => s.log && toggleSupp.mutate({ logId: s.log.id, taken: !s.taken })}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all text-left ${
                s.taken ? "bg-card/50 border border-border/20" : "bg-card border border-border/40"
              }`}
              data-testid={`supp-${s.id}`}
            >
              <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                s.taken ? "bg-primary border-primary" : "border-border/50"
              }`}>
                {s.taken && <Check size={10} className="text-primary-foreground" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] font-medium ${s.taken ? "text-muted-foreground/50 line-through" : "text-foreground"}`}>
                  {s.name}
                </p>
                <p className="text-[9px] text-muted-foreground/50 mt-0.5">{s.benefit}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-mono text-muted-foreground/60">{s.dose}</p>
                <div className="flex items-center gap-0.5 mt-0.5 justify-end">
                  <Clock size={8} className="text-muted-foreground/30" />
                  <span className="text-[8px] text-muted-foreground/40">{s.timing}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
