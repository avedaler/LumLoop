import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAssessmentSchema } from "@shared/schema";
import { z } from "zod";
import { generateCoachResponse } from "./ai-coach";
import { generateDailyProtocol } from "./agent";
import { calculateBioAge } from "./bio-age";
import bcrypt from "bcryptjs";
import Anthropic from "@anthropic-ai/sdk";

// In-memory chat history per user
const chatHistories: Map<number, { role: string; content: string }[]> = new Map();

function today() {
  return new Date().toISOString().split("T")[0];
}

// Map visitor IDs to user IDs for session persistence
const visitorSessions: Map<string, number> = new Map();

function getVisitorId(req: any): string {
  // The deploy proxy injects X-Visitor-Id header
  return req.headers["x-visitor-id"] || req.ip || "anonymous";
}

async function seedUserData(userId: number) {
  const todayStr = today();

  await storage.createDailyScore({
    userId, date: todayStr, readiness: 87, bioAge: 34.2,
    sleepScore: 92, sleepHours: 7.7, hrv: 68, energyLevel: "High",
    focusScore: 94, stressLevel: "Low",
    cardioAge: 32, sleepAge: 35, metabolicAge: 36, immuneAge: 33, muscleAge: 35,
  });

  for (let i = 1; i <= 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    await storage.createDailyScore({
      userId, date: dateStr,
      readiness: 70 + Math.floor(Math.random() * 20),
      bioAge: 34.2 + (Math.random() * 0.8 - 0.3),
      sleepScore: 70 + Math.floor(Math.random() * 25),
      sleepHours: 6.5 + Math.random() * 2,
      hrv: 50 + Math.floor(Math.random() * 25),
      energyLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      focusScore: 70 + Math.floor(Math.random() * 25),
      stressLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
      cardioAge: 31 + Math.random() * 3, sleepAge: 34 + Math.random() * 3,
      metabolicAge: 35 + Math.random() * 3, immuneAge: 32 + Math.random() * 3,
      muscleAge: 34 + Math.random() * 3,
    });
  }

  const supps = [
    { name: "Magnesium L-Threonate", dose: "2,000 mg", timing: "Morning", benefit: "Cognitive function, sleep quality, stress resilience", form: "Capsule", category: "Cognitive", confidence: 96 },
    { name: "Omega-3 EPA/DHA", dose: "2,400 mg", timing: "With meal", benefit: "Anti-inflammatory, cardiovascular, brain health", form: "Softgel", category: "Foundation", confidence: 98 },
    { name: "Vitamin D3 + K2", dose: "5,000 IU + 200 mcg", timing: "Morning", benefit: "Immune function, bone density, mood regulation", form: "Liquid drop", category: "Foundation", confidence: 95 },
    { name: "Ashwagandha KSM-66", dose: "600 mg", timing: "Evening", benefit: "Cortisol management, stress recovery, sleep onset", form: "Capsule", category: "Adaptogen", confidence: 92 },
    { name: "NMN", dose: "500 mg", timing: "Morning, fasted", benefit: "NAD+ precursor, cellular energy, longevity", form: "Sublingual", category: "Longevity", confidence: 88 },
    { name: "Creatine Monohydrate", dose: "5 g", timing: "Any time", benefit: "Cognitive reserve, ATP production, muscle recovery", form: "Powder", category: "Performance", confidence: 97 },
  ];

  for (const s of supps) {
    const supp = await storage.createSupplement({ userId, ...s, active: true });
    await storage.createSupplementLog({ userId, supplementId: supp.id, date: todayStr, taken: supps.indexOf(s) < 2 });
  }

  const mealsData = [
    { mealType: "breakfast", name: "Turmeric Avocado Bowl", calories: 480, protein: 22, carbs: 38, fat: 28, tags: "Anti-inflammatory,Brain fuel", aiRationale: "Golden turmeric with healthy fats to support morning cognitive performance" },
    { mealType: "lunch", name: "Omega-Rich Salmon Poke", calories: 520, protein: 38, carbs: 42, fat: 18, tags: "Omega-3,Recovery", aiRationale: "High EPA/DHA content to complement your supplement stack" },
    { mealType: "snack", name: "Adaptogenic Matcha Smoothie", calories: 220, protein: 12, carbs: 28, fat: 6, tags: "L-Theanine,Focus", aiRationale: "Sustained energy without cortisol spike" },
    { mealType: "dinner", name: "Grass-Fed Steak & Greens", calories: 580, protein: 42, carbs: 24, fat: 32, tags: "Iron,B12,Zinc", aiRationale: "Bioavailable micronutrients for overnight muscle repair" },
  ];
  for (const m of mealsData) {
    await storage.createMeal({ userId, date: todayStr, ...m, logged: false });
  }

  const goals = [
    { goalName: "Mental Clarity", progress: 78, icon: "brain" },
    { goalName: "Sleep Quality", progress: 85, icon: "moon" },
    { goalName: "Heart Health", progress: 72, icon: "heart" },
    { goalName: "Energy Levels", progress: 90, icon: "zap" },
    { goalName: "Recovery", progress: 68, icon: "dumbbell" },
  ];
  for (const g of goals) {
    await storage.createWellnessGoal({ userId, ...g });
  }
}

export async function registerRoutes(server: Server, app: Express) {

  // ─── SESSION: Check if visitor has existing session ───
  app.get("/api/auth/session", async (req, res) => {
    const visitorId = getVisitorId(req);
    const userId = visitorSessions.get(visitorId);
    if (userId) {
      const user = await storage.getUser(userId);
      if (user) {
        const { passwordHash, ...safeUser } = user;
        return res.json(safeUser);
      }
    }
    res.json(null);
  });

  // ─── REGISTER: Create new user and bind to visitor session ───
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email) return res.status(400).json({ error: "Name and email required" });

      const visitorId = getVisitorId(req);

      // Check if email already exists — log them in if password matches
      const existing = await storage.getUserByEmail(email.toLowerCase().trim());
      if (existing) {
        if (existing.passwordHash && password) {
          const match = await bcrypt.compare(password, existing.passwordHash);
          if (!match) return res.status(401).json({ error: "Incorrect password" });
        }
        visitorSessions.set(visitorId, existing.id);
        const { passwordHash, ...safeUser } = existing;
        return res.json(safeUser);
      }

      // Hash password if provided
      const passwordHash = password ? await bcrypt.hash(password, 10) : null;

      const user = await storage.createUser({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
      });
      await seedUserData(user.id);
      visitorSessions.set(visitorId, user.id);
      const { passwordHash: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ─── LOGIN: Existing user by email + password ───
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await storage.getUserByEmail(email.toLowerCase().trim());
    if (!user) return res.status(404).json({ error: "No account found with this email" });

    // If user has a password, verify it
    if (user.passwordHash) {
      if (!password) return res.status(401).json({ error: "Password required" });
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ error: "Incorrect password" });
    }

    const visitorId = getVisitorId(req);
    visitorSessions.set(visitorId, user.id);
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  });

  // ─── LOGOUT ───
  app.post("/api/auth/logout", async (req, res) => {
    const visitorId = getVisitorId(req);
    visitorSessions.delete(visitorId);
    res.json({ ok: true });
  });

  // ─── ASSESSMENT ───
  app.get("/api/assessment/:userId", async (req, res) => {
    const a = await storage.getAssessment(parseInt(req.params.userId));
    res.json(a || null);
  });

  app.post("/api/assessment", async (req, res) => {
    try {
      const data = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(data);
      await storage.updateUser(data.userId, { onboardingComplete: true });
      res.json(assessment);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ─── USER ───
  app.get("/api/user/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: "Not found" });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  });

  app.patch("/api/user/:id", async (req, res) => {
    const user = await storage.updateUser(parseInt(req.params.id), req.body);
    if (!user) return res.status(404).json({ error: "Not found" });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  });

  // ─── DAILY SCORES ───
  app.get("/api/scores/:userId", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 30;
    res.json(await storage.getDailyScores(parseInt(req.params.userId), limit));
  });

  app.get("/api/scores/:userId/today", async (req, res) => {
    res.json(await storage.getDailyScore(parseInt(req.params.userId), today()) || null);
  });

  // ─── SUPPLEMENTS ───
  app.get("/api/supplements/:userId", async (req, res) => {
    res.json(await storage.getSupplements(parseInt(req.params.userId)));
  });

  app.post("/api/supplements", async (req, res) => {
    try {
      res.json(await storage.createSupplement(req.body));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ─── SUPPLEMENT LOGS ───
  app.get("/api/supplement-logs/:userId/:date", async (req, res) => {
    res.json(await storage.getSupplementLogs(parseInt(req.params.userId), req.params.date));
  });

  app.patch("/api/supplement-logs/:id", async (req, res) => {
    const log = await storage.updateSupplementLog(parseInt(req.params.id), req.body.taken);
    if (!log) return res.status(404).json({ error: "Not found" });
    res.json(log);
  });

  // ─── MEALS ───
  app.get("/api/meals/:userId/:date", async (req, res) => {
    res.json(await storage.getMeals(parseInt(req.params.userId), req.params.date));
  });

  app.patch("/api/meals/:id", async (req, res) => {
    const meal = await storage.updateMeal(parseInt(req.params.id), req.body);
    if (!meal) return res.status(404).json({ error: "Not found" });
    res.json(meal);
  });

  // ─── AI COACH CHAT ───
  app.post("/api/chat/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // Get or create chat history
    if (!chatHistories.has(userId)) chatHistories.set(userId, []);
    const history = chatHistories.get(userId)!;

    // Generate response
    const reply = await generateCoachResponse(userId, message, history);

    // Update history
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: reply });

    // Keep last 20 messages
    if (history.length > 20) {
      chatHistories.set(userId, history.slice(-20));
    }

    res.json({ reply });
  });

  app.get("/api/chat/:userId/history", async (req, res) => {
    const userId = parseInt(req.params.userId);
    res.json(chatHistories.get(userId) || []);
  });

  app.delete("/api/chat/:userId/history", async (req, res) => {
    const userId = parseInt(req.params.userId);
    chatHistories.delete(userId);
    res.json({ ok: true });
  });

  // ─── GOALS ───
  app.get("/api/goals/:userId", async (req, res) => {
    res.json(await storage.getWellnessGoals(parseInt(req.params.userId)));
  });

  app.patch("/api/goals/:id", async (req, res) => {
    const goal = await storage.updateWellnessGoal(parseInt(req.params.id), req.body);
    if (!goal) return res.status(404).json({ error: "Not found" });
    res.json(goal);
  });

  // ─── CHECK-INS ───
  app.get("/api/checkins/:userId/:date", async (req, res) => {
    const checkin = await storage.getDailyCheckin(parseInt(req.params.userId), req.params.date);
    res.json(checkin || null);
  });

  app.post("/api/checkins", async (req, res) => {
    try {
      const checkin = await storage.createDailyCheckin(req.body);
      res.json(checkin);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ─── AGENT ACTIONS ───
  app.get("/api/agent-actions/:userId", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    res.json(await storage.getAgentActions(parseInt(req.params.userId), limit));
  });

  // ─── DAILY PROTOCOLS ───
  app.get("/api/protocol/:userId/:date", async (req, res) => {
    const protocol = await storage.getDailyProtocol(parseInt(req.params.userId), req.params.date);
    res.json(protocol || null);
  });

  // ─── WEEKLY REVIEWS ───
  app.get("/api/weekly-review/:userId/:week", async (req, res) => {
    const review = await storage.getWeeklyReview(parseInt(req.params.userId), req.params.week);
    res.json(review || null);
  });

  // ─── MANUAL AGENT TRIGGER ───
  app.post("/api/agent/generate-protocol/:userId", async (req, res) => {
    try {
      await generateDailyProtocol(parseInt(req.params.userId));
      const todayStr = new Date().toISOString().split("T")[0];
      const protocol = await storage.getDailyProtocol(parseInt(req.params.userId), todayStr);
      res.json(protocol || { ok: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ─── HEALTH METRICS ───
  app.post("/api/health-metrics", async (req, res) => {
    try {
      const metric = await storage.createHealthMetric(req.body);
      // Recalculate bio age after new health data
      try { await recalcBioAge(req.body.userId); } catch (e) { /* non-critical */ }
      res.json(metric);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  app.get("/api/health-metrics/:userId", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 30;
    res.json(await storage.getHealthMetrics(parseInt(req.params.userId), limit));
  });

  app.get("/api/health-metrics/:userId/:date", async (req, res) => {
    const metric = await storage.getHealthMetricByDate(parseInt(req.params.userId), req.params.date);
    res.json(metric || null);
  });

  // ─── BIOMARKERS ───
  app.post("/api/biomarkers", async (req, res) => {
    try {
      const biomarker = await storage.createBiomarker(req.body);
      // Recalculate bio age after new biomarker data
      try { await recalcBioAge(req.body.userId); } catch (e) { /* non-critical */ }
      res.json(biomarker);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  app.get("/api/biomarkers/:userId", async (req, res) => {
    res.json(await storage.getBiomarkers(parseInt(req.params.userId)));
  });

  app.get("/api/biomarkers/:userId/:name", async (req, res) => {
    res.json(await storage.getBiomarkersByName(parseInt(req.params.userId), req.params.name));
  });

  // ─── MEALS CREATE + AI ESTIMATE ───
  app.post("/api/meals", async (req, res) => {
    try {
      const meal = await storage.createMeal(req.body);
      res.json(meal);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  app.post("/api/meals/estimate", async (req, res) => {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: "Description required" });

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({ calories: 400, protein: 25, carbs: 35, fat: 18, name: description });
    }

    try {
      const anthropic = new Anthropic();
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{ role: "user", content: `Estimate the macronutrients for this meal: "${description}". Return ONLY valid JSON: {"name": "meal name", "calories": number, "protein": number, "carbs": number, "fat": number}` }],
        system: "You are a nutrition expert. Estimate calories, protein, carbs, and fat for the described meal. Be reasonably accurate. Return ONLY valid JSON, no markdown.",
      });
      const text = response.content[0].type === "text" ? response.content[0].text : "";
      const parsed = JSON.parse(text.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
      res.json(parsed);
    } catch {
      res.json({ calories: 400, protein: 25, carbs: 35, fat: 18, name: description });
    }
  });

  // ─── DAILY SCORES CREATE/UPDATE ───
  app.post("/api/scores/:userId", async (req, res) => {
    try {
      const score = await storage.upsertDailyScore({ userId: parseInt(req.params.userId), ...req.body });
      res.json(score);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ─── APPLE HEALTH IMPORT ───
  app.post("/api/import/apple-health", async (req, res) => {
    try {
      const { userId, records } = req.body;
      if (!userId || !records || !Array.isArray(records)) {
        return res.status(400).json({ error: "userId and records array required" });
      }

      let imported = 0;
      // Records should be pre-parsed client-side as: { date, sleepHours?, hrv?, restingHR?, steps?, weight? }
      for (const record of records) {
        if (!record.date) continue;
        const existing = await storage.getHealthMetricByDate(userId, record.date);
        if (existing) continue; // skip duplicates
        await storage.createHealthMetric({
          userId,
          date: record.date,
          sleepHours: record.sleepHours ?? null,
          hrv: record.hrv ?? null,
          restingHR: record.restingHR ?? null,
          steps: record.steps ?? null,
          weight: record.weight ?? null,
          sleepQuality: null,
          bodyFat: null,
          bloodPressureSys: null,
          bloodPressureDia: null,
          bloodGlucose: null,
          bodyTemp: null,
          oxygenSat: null,
          source: "apple_health",
        });
        imported++;
      }

      // Recalculate bio age with latest data
      try { await recalcBioAge(userId); } catch (e) { /* non-critical */ }

      res.json({ ok: true, imported });
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ─── BIO AGE RECALC HELPER ───
  async function recalcBioAge(userId: number) {
    const user = await storage.getUser(userId);
    if (!user) return;

    const todayDate = today();
    const latestMetric = await storage.getHealthMetricByDate(userId, todayDate);
    const allBiomarkers = await storage.getBiomarkers(userId);

    // Get latest value for key biomarkers
    const getLatest = (name: string) => {
      const found = allBiomarkers.find(b => b.name === name);
      return found?.value;
    };

    // Estimate chronological age (default 40 if unknown)
    const chronoAge = user.createdAt ? 40 : 40;

    // Calculate supplement adherence
    const logs = await storage.getSupplementLogs(userId, todayDate);
    const supps = await storage.getSupplements(userId);
    const adherence = supps.length > 0 ? (logs.filter(l => l.taken).length / supps.length) * 100 : 50;

    const result = calculateBioAge(
      chronoAge,
      {
        sleepHours: latestMetric?.sleepHours ?? undefined,
        hrv: latestMetric?.hrv ?? undefined,
        restingHR: latestMetric?.restingHR ?? undefined,
        steps: latestMetric?.steps ?? undefined,
        bodyFat: latestMetric?.bodyFat ?? undefined,
        weight: latestMetric?.weight ?? undefined,
      },
      {
        cortisol: getLatest("cortisol"),
        vitaminD: getLatest("vitamin_d"),
        hsCRP: getLatest("hs_crp"),
        hba1c: getLatest("hba1c"),
      },
      adherence
    );

    // Upsert daily score
    await storage.upsertDailyScore({
      userId,
      date: todayDate,
      bioAge: result.bioAge,
      cardioAge: result.cardioAge,
      sleepAge: result.sleepAge,
      metabolicAge: result.metabolicAge,
      immuneAge: result.immuneAge,
      muscleAge: result.muscleAge,
      hrv: latestMetric?.hrv ?? null,
      sleepHours: latestMetric?.sleepHours ?? null,
      sleepScore: latestMetric?.sleepQuality ? latestMetric.sleepQuality * 20 : null,
      readiness: null,
      energyLevel: null,
      focusScore: null,
      stressLevel: null,
    });
  }

  // ─── WAITLIST ───
  const waitlistEmails: Set<string> = new Set();

  app.post("/api/waitlist", async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email required" });
    }
    waitlistEmails.add(email.toLowerCase().trim());
    console.log(`[waitlist] New signup: ${email} (total: ${waitlistEmails.size})`);

    // Also create a user account so they can go straight into the app
    try {
      let user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        const name = email.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim() || "Member";
        user = await storage.createUser({ email: email.toLowerCase().trim(), name });
      }
      res.json({ ok: true, userId: user.id });
    } catch (e) {
      res.json({ ok: true });
    }
  });
}
