import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAssessmentSchema, insertSupplementSchema, insertSupplementLogSchema, insertMealSchema, insertWellnessGoalSchema } from "@shared/schema";
import { z } from "zod";

// Helper: get today's date string
function today() {
  return new Date().toISOString().split("T")[0];
}

// Seed default data for a new user
async function seedUserData(userId: number) {
  const todayStr = today();

  // Daily score
  await storage.createDailyScore({
    userId, date: todayStr, readiness: 87, bioAge: 34.2,
    sleepScore: 92, sleepHours: 7.7, hrv: 68, energyLevel: "High",
    focusScore: 94, stressLevel: "Low",
    cardioAge: 32, sleepAge: 35, metabolicAge: 36, immuneAge: 33, muscleAge: 35,
  });

  // Past 7 days of scores
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
      cardioAge: 31 + Math.random() * 3,
      sleepAge: 34 + Math.random() * 3,
      metabolicAge: 35 + Math.random() * 3,
      immuneAge: 32 + Math.random() * 3,
      muscleAge: 34 + Math.random() * 3,
    });
  }

  // Supplements
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
    // Create logs for today (first 2 taken)
    await storage.createSupplementLog({
      userId, supplementId: supp.id, date: todayStr,
      taken: supps.indexOf(s) < 2,
    });
  }

  // Meals
  const mealsData = [
    { mealType: "breakfast", name: "Turmeric Avocado Bowl", calories: 480, protein: 22, carbs: 38, fat: 28, tags: "Anti-inflammatory,Brain fuel", aiRationale: "Golden turmeric with healthy fats to support morning cognitive performance" },
    { mealType: "lunch", name: "Omega-Rich Salmon Poke", calories: 520, protein: 38, carbs: 42, fat: 18, tags: "Omega-3,Recovery", aiRationale: "High EPA/DHA content to complement your supplement stack and reduce inflammation" },
    { mealType: "snack", name: "Adaptogenic Matcha Smoothie", calories: 220, protein: 12, carbs: 28, fat: 6, tags: "L-Theanine,Focus", aiRationale: "Sustained energy without cortisol spike" },
    { mealType: "dinner", name: "Grass-Fed Steak & Greens", calories: 580, protein: 42, carbs: 24, fat: 32, tags: "Iron,B12,Zinc", aiRationale: "Bioavailable micronutrients for overnight muscle repair and HRV optimization" },
  ];

  for (const m of mealsData) {
    await storage.createMeal({ userId, date: todayStr, ...m, logged: false });
  }

  // Wellness Goals
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
  // ─── AUTH / USER ───
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.json(existing);
      }
      const user = await storage.createUser(data);
      await seedUserData(user.id);
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/user/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.patch("/api/user/:id", async (req, res) => {
    const user = await storage.updateUser(parseInt(req.params.id), req.body);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // ─── ASSESSMENT ───
  app.get("/api/assessment/:userId", async (req, res) => {
    const assessment = await storage.getAssessment(parseInt(req.params.userId));
    res.json(assessment || null);
  });

  app.post("/api/assessment", async (req, res) => {
    try {
      const data = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(data);
      // Mark onboarding complete
      await storage.updateUser(data.userId, { onboardingComplete: true });
      res.json(assessment);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ─── DAILY SCORES ───
  app.get("/api/scores/:userId", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 30;
    const scores = await storage.getDailyScores(parseInt(req.params.userId), limit);
    res.json(scores);
  });

  app.get("/api/scores/:userId/today", async (req, res) => {
    const score = await storage.getDailyScore(parseInt(req.params.userId), today());
    res.json(score || null);
  });

  // ─── SUPPLEMENTS ───
  app.get("/api/supplements/:userId", async (req, res) => {
    const supplements = await storage.getSupplements(parseInt(req.params.userId));
    res.json(supplements);
  });

  app.post("/api/supplements", async (req, res) => {
    try {
      const data = insertSupplementSchema.parse(req.body);
      const supplement = await storage.createSupplement(data);
      res.json(supplement);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ─── SUPPLEMENT LOGS ───
  app.get("/api/supplement-logs/:userId/:date", async (req, res) => {
    const logs = await storage.getSupplementLogs(parseInt(req.params.userId), req.params.date);
    res.json(logs);
  });

  app.patch("/api/supplement-logs/:id", async (req, res) => {
    const log = await storage.updateSupplementLog(parseInt(req.params.id), req.body.taken);
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json(log);
  });

  // ─── MEALS ───
  app.get("/api/meals/:userId/:date", async (req, res) => {
    const meals = await storage.getMeals(parseInt(req.params.userId), req.params.date);
    res.json(meals);
  });

  app.patch("/api/meals/:id", async (req, res) => {
    const meal = await storage.updateMeal(parseInt(req.params.id), req.body);
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.json(meal);
  });

  // ─── WELLNESS GOALS ───
  app.get("/api/goals/:userId", async (req, res) => {
    const goals = await storage.getWellnessGoals(parseInt(req.params.userId));
    res.json(goals);
  });

  app.patch("/api/goals/:id", async (req, res) => {
    const goal = await storage.updateWellnessGoal(parseInt(req.params.id), req.body);
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    res.json(goal);
  });
}
