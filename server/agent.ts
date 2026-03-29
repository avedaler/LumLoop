import cron from "node-cron";
import { storage } from "./storage";
import type { User, DailyScore, Supplement } from "@shared/schema";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ─── TEMPLATE PROTOCOL (no API key needed) ───
function generateTemplateProtocol(user: User, supplements: Supplement[], latestScore: DailyScore | undefined, latestMetric?: any) {
  const isLowEnergy = latestScore?.energyLevel === "Low";
  const name = user.name.split(" ")[0];
  const sleepNote = latestMetric?.sleepHours ? ` You logged ${latestMetric.sleepHours}h of sleep.` : "";
  const hrvNote = latestMetric?.hrv ? ` HRV: ${latestMetric.hrv}ms.` : "";
  return {
    summary: `Good morning ${name}. Today's protocol focuses on ${isLowEnergy ? "energy recovery — prioritize rest and adaptogens" : "maintaining your momentum — stay consistent with your stack"}.${sleepNote}${hrvNote}`,
    supplements: supplements.map(s => ({
      name: s.name, dose: s.dose, timing: s.timing, note: s.benefit,
    })),
    meals: [
      { mealType: "breakfast", name: "Protein-Rich Breakfast Bowl", calories: 450, protein: 30, carbs: 35, fat: 22, tags: "Brain fuel,Anti-inflammatory", aiRationale: "High protein breakfast to support morning cognitive function" },
      { mealType: "lunch", name: "Mediterranean Salmon Bowl", calories: 520, protein: 38, carbs: 40, fat: 20, tags: "Omega-3,Recovery", aiRationale: "Omega-3 rich lunch to complement supplement stack" },
      { mealType: "snack", name: "Green Adaptogen Smoothie", calories: 200, protein: 12, carbs: 24, fat: 6, tags: "Focus,Energy", aiRationale: "Sustained afternoon energy without cortisol spike" },
      { mealType: "dinner", name: "Grass-Fed Steak & Roasted Vegetables", calories: 560, protein: 42, carbs: 28, fat: 30, tags: "Iron,Zinc,B12", aiRationale: "Bioavailable micronutrients for overnight recovery" },
    ],
    recovery: [
      { type: "breathwork", name: "4-7-8 Breathing", duration: "10 min", timing: "Afternoon", rationale: "Parasympathetic activation for stress recovery" },
    ],
    reasoning: "Protocol generated based on your recent wellness data and primary goal.",
  };
}

// ─── DAILY PROTOCOL GENERATOR ───
async function generateDailyProtocol(userId: number) {
  const user = await storage.getUser(userId);
  if (!user) return;

  const today = todayStr();

  // Check if already generated today
  const existing = await storage.getDailyProtocol(userId, today);
  if (existing) return;

  // Gather context — use real health metrics if available
  const scores = await storage.getDailyScores(userId, 7);
  const supplements = await storage.getSupplements(userId);
  const latestMetric = await storage.getHealthMetricByDate(userId, today);

  // Generate template protocol (AI version would go here with ANTHROPIC_API_KEY check)
  const protocol = generateTemplateProtocol(user, supplements, scores[0], latestMetric);

  // Save to DB
  await storage.createDailyProtocol({
    userId,
    date: today,
    protocol: JSON.stringify(protocol),
    reasoning: protocol.reasoning,
  });

  // Log the action
  await storage.createAgentAction({
    userId,
    date: today,
    actionType: "protocol_generated",
    title: "Daily protocol generated",
    description: `Generated your personalized protocol for ${today}. ${protocol.summary}`,
  });

  // Create today's supplement logs if they don't exist
  const existingLogs = await storage.getSupplementLogs(userId, today);
  for (const supp of supplements) {
    if (!existingLogs.find(l => l.supplementId === supp.id)) {
      await storage.createSupplementLog({ userId, supplementId: supp.id, date: today, taken: false });
    }
  }

  // Create today's meals from protocol
  const existingMeals = await storage.getMeals(userId, today);
  if (existingMeals.length === 0 && protocol.meals) {
    for (const meal of protocol.meals) {
      await storage.createMeal({ userId, date: today, ...meal, logged: false });
    }
  }
}

// ─── WEEKLY REVIEW ───
async function generateWeeklyReview(userId: number) {
  const user = await storage.getUser(userId);
  if (!user) return;

  const now = new Date();
  const weekEnd = now.toISOString().split("T")[0];
  const weekStartDate = new Date(now);
  weekStartDate.setDate(weekStartDate.getDate() - 7);
  const weekStart = weekStartDate.toISOString().split("T")[0];

  // Check if already generated this week
  const existing = await storage.getWeeklyReview(userId, weekStart);
  if (existing) return;

  const scores = await storage.getDailyScores(userId, 7);
  const supplements = await storage.getSupplements(userId);

  // Compute averages
  const avgHrv = scores.length > 0 ? Math.round(scores.reduce((a, s) => a + (s.hrv || 0), 0) / scores.length) : 0;
  const avgSleep = scores.length > 0 ? (scores.reduce((a, s) => a + (s.sleepHours || 0), 0) / scores.length).toFixed(1) : "0";
  const avgReadiness = scores.length > 0 ? Math.round(scores.reduce((a, s) => a + (s.readiness || 0), 0) / scores.length) : 0;
  const name = user.name.split(" ")[0];

  const summary = `${name}, here's your week in review. Average HRV: ${avgHrv}ms, Sleep: ${avgSleep}h/night, Readiness: ${avgReadiness}/100. ` +
    `Your supplement stack of ${supplements.length} items is supporting your wellness goals. ` +
    (avgHrv > 60 ? "HRV is trending strong — your recovery systems are working well." : "Consider prioritizing recovery this week — your HRV could use a boost.");

  const insights = JSON.stringify([
    `Average HRV: ${avgHrv}ms`,
    `Average Sleep: ${avgSleep}h per night`,
    `Average Readiness: ${avgReadiness}/100`,
    `${supplements.length} active supplements in protocol`,
  ]);

  await storage.createWeeklyReview({
    userId,
    weekStart,
    weekEnd,
    summary,
    insights,
    adjustments: null,
    overallScore: avgReadiness,
  });

  await storage.createAgentAction({
    userId,
    date: weekEnd,
    actionType: "weekly_review",
    title: "Weekly review completed",
    description: summary,
  });
}

// ─── SMART REMINDERS ───
async function checkReminders() {
  const hour = new Date().getUTCHours();
  const users = await storage.getAllUsers();
  const today = todayStr();

  for (const user of users) {
    try {
      // Check notification preferences
      const prefs = await storage.getNotificationPreferences(user.id);
      const suppReminders = prefs?.supplementReminders !== false;
      const checkinReminders = prefs?.checkinReminders !== false;

      // Morning supplements (around 7am — check hour 23 UTC for UTC+8, or just run at varying hours)
      if (suppReminders && (hour === 7 || hour === 23)) {
        const recentActions = await storage.getAgentActions(user.id, 5);
        const alreadySent = recentActions.some(a => a.date === today && a.actionType === "reminder_sent" && a.title.includes("Morning"));
        if (!alreadySent) {
          await storage.createAgentAction({
            userId: user.id,
            date: today,
            actionType: "reminder_sent",
            title: "Morning supplement reminder",
            description: `Time for your morning supplements, ${user.name.split(" ")[0]}. Check your protocol for today's stack.`,
          });
        }
      }

      // Evening supplements (around 8pm)
      if (suppReminders && (hour === 12 || hour === 20)) {
        const recentActions = await storage.getAgentActions(user.id, 5);
        const alreadySent = recentActions.some(a => a.date === today && a.actionType === "reminder_sent" && a.title.includes("Evening"));
        if (!alreadySent) {
          await storage.createAgentAction({
            userId: user.id,
            date: today,
            actionType: "reminder_sent",
            title: "Evening supplement reminder",
            description: `Don't forget your evening supplements. Ashwagandha works best taken 1-2 hours before sleep.`,
          });
        }
      }

      // Daily check-in prompt (around 9pm)
      if (checkinReminders && (hour === 13 || hour === 21)) {
        const recentActions = await storage.getAgentActions(user.id, 5);
        const alreadySent = recentActions.some(a => a.date === today && a.actionType === "reminder_sent" && a.title.includes("check-in"));
        if (!alreadySent) {
          await storage.createAgentAction({
            userId: user.id,
            date: today,
            actionType: "reminder_sent",
            title: "Daily check-in",
            description: `How was your day, ${user.name.split(" ")[0]}? Take 30 seconds to log your energy, mood, and sleep quality.`,
          });
        }
      }
    } catch (e) {
      console.error(`[agent] Reminder error for user ${user.id}:`, e);
    }
  }
}

// ─── ANOMALY DETECTION ───
async function checkAnomalies(userId: number) {
  // Check real health metrics first, fall back to daily scores
  const metrics = await storage.getHealthMetrics(userId, 7);
  let recentHrv: number | null = null;
  let avgHrv = 0;

  if (metrics.length >= 3) {
    recentHrv = metrics[0]?.hrv ?? null;
    const olderHrvs = metrics.slice(1).filter(m => m.hrv != null).map(m => m.hrv!);
    avgHrv = olderHrvs.length > 0 ? olderHrvs.reduce((a, b) => a + b, 0) / olderHrvs.length : 0;
  } else {
    const scores = await storage.getDailyScores(userId, 7);
    if (scores.length < 3) return;
    recentHrv = scores[0]?.hrv ?? null;
    const older = scores.slice(1);
    avgHrv = older.reduce((acc, s) => acc + (s.hrv || 0), 0) / older.length;
  }

  if (recentHrv && avgHrv > 0 && recentHrv < avgHrv * 0.8) {
    // Check anomaly alert preference
    const prefs = await storage.getNotificationPreferences(userId);
    if (prefs?.anomalyAlerts === false) return;

    const today = todayStr();
    const recentActions = await storage.getAgentActions(userId, 5);
    const alreadyDetected = recentActions.some(a => a.date === today && a.actionType === "anomaly_detected");
    if (!alreadyDetected) {
      await storage.createAgentAction({
        userId,
        date: today,
        actionType: "anomaly_detected",
        title: "HRV drop detected",
        description: `Your HRV (${recentHrv}ms) is ${Math.round((1 - recentHrv! / avgHrv) * 100)}% below your 7-day average. Consider reducing training intensity today and prioritizing sleep tonight.`,
      });
    }
  }
}

// ─── PROTOCOL ADJUSTMENTS (during weekly review) ───
async function generateProtocolAdjustments(userId: number) {
  const user = await storage.getUser(userId);
  if (!user) return;

  const today = todayStr();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStart = weekAgo.toISOString().split("T")[0];

  const supplements = await storage.getSupplements(userId);
  const logs = await storage.getSupplementLogsRange(userId, weekStart, today);
  const metrics = await storage.getHealthMetrics(userId, 7);
  const scores = await storage.getDailyScores(userId, 7);

  // Calculate per-supplement adherence
  for (const supp of supplements) {
    const suppLogs = logs.filter(l => l.supplementId === supp.id);
    const totalDays = 7;
    const takenDays = suppLogs.filter(l => l.taken).length;
    const adherence = totalDays > 0 ? (takenDays / totalDays) * 100 : 0;

    // Low adherence → suggest timing change
    if (adherence < 40) {
      await storage.createProtocolAdjustment({
        userId, date: today, adjustmentType: "change_timing",
        targetName: supp.name, oldValue: supp.timing,
        newValue: supp.timing === "Morning" ? "Evening" : "Morning",
        reasoning: `You've only taken ${supp.name} ${takenDays} of 7 days (${Math.round(adherence)}%). Switching timing may improve adherence.`,
        accepted: null,
      });
    }
  }

  // HRV dropping → suggest magnesium increase
  if (metrics.length >= 3) {
    const recentHrvs = metrics.filter(m => m.hrv != null).map(m => m.hrv!);
    if (recentHrvs.length >= 3) {
      const trend = recentHrvs[0] - recentHrvs[recentHrvs.length - 1];
      if (trend < -5) {
        const magSupp = supplements.find(s => s.name.toLowerCase().includes("magnesium"));
        if (magSupp) {
          await storage.createProtocolAdjustment({
            userId, date: today, adjustmentType: "modify_dose",
            targetName: magSupp.name, oldValue: magSupp.dose,
            newValue: "2,500 mg",
            reasoning: `HRV has been declining this week. Increasing magnesium may support parasympathetic recovery.`,
            accepted: null,
          });
        }
      }
    }
  }

  // Sleep quality declining → suggest ashwagandha dose increase
  if (scores.length >= 3) {
    const recentSleep = scores.filter(s => s.sleepHours != null).map(s => s.sleepHours!);
    if (recentSleep.length >= 3 && recentSleep[0] < 6.5) {
      const ashwa = supplements.find(s => s.name.toLowerCase().includes("ashwagandha"));
      if (ashwa) {
        await storage.createProtocolAdjustment({
          userId, date: today, adjustmentType: "modify_dose",
          targetName: ashwa.name, oldValue: ashwa.dose,
          newValue: "900 mg",
          reasoning: `Sleep has been below 6.5h recently. A higher dose of Ashwagandha may improve sleep onset.`,
          accepted: null,
        });
      }
    }
  }

  // Log the action
  await storage.createAgentAction({
    userId, date: today, actionType: "protocol_adjustment",
    title: "Protocol adjustments generated",
    description: `Analyzed your 7-day data and generated personalized protocol adjustment recommendations.`,
  });
}

// ─── SUPPLEMENT EFFECTIVENESS SCORING ───
async function calculateSupplementEffectiveness(userId: number) {
  const supplements = await storage.getSupplements(userId);
  const today = todayStr();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStart = weekAgo.toISOString().split("T")[0];

  const logs = await storage.getSupplementLogsRange(userId, weekStart, today);
  const metrics = await storage.getHealthMetrics(userId, 14);

  // Split metrics into this week and previous week
  const thisWeek = metrics.filter(m => m.date >= weekStart);
  const prevWeek = metrics.filter(m => m.date < weekStart);

  for (const supp of supplements) {
    const suppLogs = logs.filter(l => l.supplementId === supp.id);
    const totalDays = 7;
    const takenDays = suppLogs.filter(l => l.taken).length;
    const adherenceRate = totalDays > 0 ? Math.round((takenDays / totalDays) * 100) : 0;

    // Determine correlated metric based on supplement category/name
    let correlatedMetric = "hrv";
    const nameLower = supp.name.toLowerCase();
    if (nameLower.includes("magnesium") || nameLower.includes("ashwagandha")) correlatedMetric = "sleep";
    else if (nameLower.includes("omega") || nameLower.includes("creatine")) correlatedMetric = "hrv";
    else if (nameLower.includes("vitamin d") || nameLower.includes("nmn")) correlatedMetric = "energy";

    // Get metric values
    const getMetricVal = (m: any) => {
      if (correlatedMetric === "sleep") return m.sleepHours;
      if (correlatedMetric === "hrv") return m.hrv;
      return null;
    };

    const thisWeekVals = thisWeek.map(getMetricVal).filter((v): v is number => v != null);
    const prevWeekVals = prevWeek.map(getMetricVal).filter((v): v is number => v != null);

    const metricAfter = thisWeekVals.length > 0 ? thisWeekVals.reduce((a, b) => a + b, 0) / thisWeekVals.length : null;
    const metricBefore = prevWeekVals.length > 0 ? prevWeekVals.reduce((a, b) => a + b, 0) / prevWeekVals.length : null;

    // Calculate effectiveness: adherence weight + metric improvement
    let effectivenessScore = Math.min(adherenceRate, 100);
    if (metricBefore != null && metricAfter != null && metricBefore > 0) {
      const improvement = ((metricAfter - metricBefore) / metricBefore) * 100;
      effectivenessScore = Math.round(Math.min(Math.max((adherenceRate * 0.6) + (improvement > 0 ? improvement * 4 : improvement * 2) + 40, 0), 100));
    }

    await storage.createSupplementEffectiveness({
      userId, supplementId: supp.id, weekStart,
      adherenceRate, correlatedMetric,
      metricBefore: metricBefore != null ? Math.round(metricBefore * 10) / 10 : null,
      metricAfter: metricAfter != null ? Math.round(metricAfter * 10) / 10 : null,
      effectivenessScore,
      notes: `${takenDays}/${totalDays} days taken. Correlated with ${correlatedMetric}.`,
    });
  }
}

// ─── INITIALIZE CRON JOBS ───
export function initializeAgent() {
  console.log("[agent] Initializing autonomous wellness agent...");

  // Daily protocol: 6:00 AM UTC+8 = 22:00 UTC
  cron.schedule("0 22 * * *", async () => {
    console.log("[agent] Running daily protocol generation...");
    const users = await storage.getAllUsers();
    for (const user of users) {
      try { await generateDailyProtocol(user.id); } catch (e) { console.error(`[agent] Protocol error for user ${user.id}:`, e); }
    }
  });

  // Smart reminders: every 2 hours
  cron.schedule("0 */2 * * *", async () => {
    try { await checkReminders(); } catch (e) { console.error("[agent] Reminder error:", e); }
  });

  // Weekly review + adjustments: Sunday 9:00 AM UTC+8 = 1:00 UTC
  cron.schedule("0 1 * * 0", async () => {
    console.log("[agent] Running weekly review + adjustments...");
    const users = await storage.getAllUsers();
    for (const user of users) {
      try { await generateWeeklyReview(user.id); } catch (e) { console.error(`[agent] Weekly review error for user ${user.id}:`, e); }
      try { await generateProtocolAdjustments(user.id); } catch (e) { console.error(`[agent] Adjustment error for user ${user.id}:`, e); }
    }
  });

  // Weekly effectiveness scoring: Sunday 2:00 AM UTC
  cron.schedule("0 2 * * 0", async () => {
    console.log("[agent] Running supplement effectiveness scoring...");
    const users = await storage.getAllUsers();
    for (const user of users) {
      try { await calculateSupplementEffectiveness(user.id); } catch (e) { console.error(`[agent] Effectiveness error for user ${user.id}:`, e); }
    }
  });

  // Anomaly check: daily at 10 PM UTC+8 = 14:00 UTC
  cron.schedule("0 14 * * *", async () => {
    console.log("[agent] Running anomaly detection...");
    const users = await storage.getAllUsers();
    for (const user of users) {
      try { await checkAnomalies(user.id); } catch (e) { console.error("[agent] Anomaly error:", e); }
    }
  });

  // Generate protocols immediately for any users who don't have one today
  setTimeout(async () => {
    try {
      const users = await storage.getAllUsers();
      const today = todayStr();
      for (const user of users) {
        const existing = await storage.getDailyProtocol(user.id, today);
        if (!existing) {
          try { await generateDailyProtocol(user.id); } catch (e) { console.error(`[agent] Startup protocol error:`, e); }
        }
      }
      console.log("[agent] Startup protocol check complete.");
    } catch (e) {
      console.error("[agent] Startup error:", e);
    }
  }, 3000);

  console.log("[agent] Agent initialized. Crons scheduled.");
}

// Export for manual trigger from routes
export { generateDailyProtocol };
