import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── USERS ───
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash"),
  onboardingComplete: integer("onboarding_complete", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, passwordHash: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── HEALTH ASSESSMENT ───
export const assessments = sqliteTable("assessments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  primaryGoal: text("primary_goal"),
  sleepQuality: text("sleep_quality"),
  stressLevel: text("stress_level"),
  supplementUse: text("supplement_use"),
  dietStyle: text("diet_style"),
  exerciseFrequency: text("exercise_frequency"),
  glp1User: integer("glp1_user", { mode: "boolean" }).default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({ id: true, completedAt: true });
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

// ─── DAILY SCORES ───
export const dailyScores = sqliteTable("daily_scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  readiness: integer("readiness"),
  bioAge: real("bio_age"),
  sleepScore: integer("sleep_score"),
  sleepHours: real("sleep_hours"),
  hrv: integer("hrv"),
  energyLevel: text("energy_level"),
  focusScore: integer("focus_score"),
  stressLevel: text("stress_level"),
  cardioAge: real("cardio_age"),
  sleepAge: real("sleep_age"),
  metabolicAge: real("metabolic_age"),
  immuneAge: real("immune_age"),
  muscleAge: real("muscle_age"),
});

export const insertDailyScoreSchema = createInsertSchema(dailyScores).omit({ id: true });
export type InsertDailyScore = z.infer<typeof insertDailyScoreSchema>;
export type DailyScore = typeof dailyScores.$inferSelect;

// ─── SUPPLEMENTS ───
export const supplements = sqliteTable("supplements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  dose: text("dose").notNull(),
  timing: text("timing").notNull(),
  benefit: text("benefit"),
  form: text("form"),
  category: text("category"),
  confidence: integer("confidence"),
  active: integer("active", { mode: "boolean" }).default(true),
});

export const insertSupplementSchema = createInsertSchema(supplements).omit({ id: true });
export type InsertSupplement = z.infer<typeof insertSupplementSchema>;
export type Supplement = typeof supplements.$inferSelect;

// ─── SUPPLEMENT LOG (daily adherence) ───
export const supplementLogs = sqliteTable("supplement_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  supplementId: integer("supplement_id").notNull(),
  date: text("date").notNull(),
  taken: integer("taken", { mode: "boolean" }).default(false),
  takenAt: integer("taken_at", { mode: "timestamp" }),
});

export const insertSupplementLogSchema = createInsertSchema(supplementLogs).omit({ id: true, takenAt: true });
export type InsertSupplementLog = z.infer<typeof insertSupplementLogSchema>;
export type SupplementLog = typeof supplementLogs.$inferSelect;

// ─── MEALS ───
export const meals = sqliteTable("meals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, snack, dinner
  name: text("name").notNull(),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  tags: text("tags"), // comma-separated
  aiRationale: text("ai_rationale"),
  logged: integer("logged", { mode: "boolean" }).default(false),
});

export const insertMealSchema = createInsertSchema(meals).omit({ id: true });
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

// ─── WELLNESS GOALS ───
export const wellnessGoals = sqliteTable("wellness_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  goalName: text("goal_name").notNull(),
  progress: integer("progress").default(0),
  icon: text("icon"),
});

export const insertWellnessGoalSchema = createInsertSchema(wellnessGoals).omit({ id: true });
export type InsertWellnessGoal = z.infer<typeof insertWellnessGoalSchema>;
export type WellnessGoal = typeof wellnessGoals.$inferSelect;

// ─── DAILY CHECK-INS (user self-report) ───
export const dailyCheckins = sqliteTable("daily_checkins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  sleepQuality: integer("sleep_quality"),
  energyLevel: integer("energy_level"),
  mood: integer("mood"),
  stressLevel: integer("stress_level"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertDailyCheckinSchema = createInsertSchema(dailyCheckins).omit({ id: true, createdAt: true });
export type InsertDailyCheckin = z.infer<typeof insertDailyCheckinSchema>;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;

// ─── AGENT ACTIONS LOG (what the AI did) ───
export const agentActions = sqliteTable("agent_actions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  actionType: text("action_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  metadata: text("metadata"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertAgentActionSchema = createInsertSchema(agentActions).omit({ id: true, createdAt: true });
export type InsertAgentAction = z.infer<typeof insertAgentActionSchema>;
export type AgentAction = typeof agentActions.$inferSelect;

// ─── DAILY PROTOCOLS (AI-generated daily plan) ───
export const dailyProtocols = sqliteTable("daily_protocols", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  protocol: text("protocol").notNull(),
  reasoning: text("reasoning"),
  generatedAt: integer("generated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertDailyProtocolSchema = createInsertSchema(dailyProtocols).omit({ id: true, generatedAt: true });
export type InsertDailyProtocol = z.infer<typeof insertDailyProtocolSchema>;
export type DailyProtocol = typeof dailyProtocols.$inferSelect;

// ─── WEEKLY REVIEWS (AI weekly analysis) ───
export const weeklyReviews = sqliteTable("weekly_reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  weekStart: text("week_start").notNull(),
  weekEnd: text("week_end").notNull(),
  summary: text("summary").notNull(),
  insights: text("insights"),
  adjustments: text("adjustments"),
  overallScore: integer("overall_score"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertWeeklyReviewSchema = createInsertSchema(weeklyReviews).omit({ id: true, createdAt: true });
export type InsertWeeklyReview = z.infer<typeof insertWeeklyReviewSchema>;
export type WeeklyReview = typeof weeklyReviews.$inferSelect;
