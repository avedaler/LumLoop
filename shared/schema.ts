import { pgTable, text, serial, integer, boolean, real, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── USERS ───
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── HEALTH ASSESSMENT ───
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  primaryGoal: text("primary_goal"),
  sleepQuality: text("sleep_quality"),
  stressLevel: text("stress_level"),
  supplementUse: text("supplement_use"),
  dietStyle: text("diet_style"),
  exerciseFrequency: text("exercise_frequency"),
  glp1User: boolean("glp1_user").default(false),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({ id: true, completedAt: true });
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

// ─── DAILY SCORES ───
export const dailyScores = pgTable("daily_scores", {
  id: serial("id").primaryKey(),
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
export const supplements = pgTable("supplements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  dose: text("dose").notNull(),
  timing: text("timing").notNull(),
  benefit: text("benefit"),
  form: text("form"),
  category: text("category"),
  confidence: integer("confidence"),
  active: boolean("active").default(true),
});

export const insertSupplementSchema = createInsertSchema(supplements).omit({ id: true });
export type InsertSupplement = z.infer<typeof insertSupplementSchema>;
export type Supplement = typeof supplements.$inferSelect;

// ─── SUPPLEMENT LOG (daily adherence) ───
export const supplementLogs = pgTable("supplement_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  supplementId: integer("supplement_id").notNull(),
  date: text("date").notNull(),
  taken: boolean("taken").default(false),
  takenAt: timestamp("taken_at"),
});

export const insertSupplementLogSchema = createInsertSchema(supplementLogs).omit({ id: true, takenAt: true });
export type InsertSupplementLog = z.infer<typeof insertSupplementLogSchema>;
export type SupplementLog = typeof supplementLogs.$inferSelect;

// ─── MEALS ───
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
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
  logged: boolean("logged").default(false),
});

export const insertMealSchema = createInsertSchema(meals).omit({ id: true });
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

// ─── WELLNESS GOALS ───
export const wellnessGoals = pgTable("wellness_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  goalName: text("goal_name").notNull(),
  progress: integer("progress").default(0),
  icon: text("icon"),
});

export const insertWellnessGoalSchema = createInsertSchema(wellnessGoals).omit({ id: true });
export type InsertWellnessGoal = z.infer<typeof insertWellnessGoalSchema>;
export type WellnessGoal = typeof wellnessGoals.$inferSelect;
