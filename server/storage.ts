import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, desc } from "drizzle-orm";
import {
  users, assessments, dailyScores, supplements, supplementLogs, meals, wellnessGoals,
} from "@shared/schema";
import type {
  User, InsertUser,
  Assessment, InsertAssessment,
  DailyScore, InsertDailyScore,
  Supplement, InsertSupplement,
  SupplementLog, InsertSupplementLog,
  Meal, InsertMeal,
  WellnessGoal, InsertWellnessGoal,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { passwordHash?: string | null }): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser & { onboardingComplete: boolean; passwordHash: string }>): Promise<User | undefined>;

  // Assessments
  getAssessment(userId: number): Promise<Assessment | undefined>;
  createAssessment(data: InsertAssessment): Promise<Assessment>;

  // Daily Scores
  getDailyScores(userId: number, limit?: number): Promise<DailyScore[]>;
  getDailyScore(userId: number, date: string): Promise<DailyScore | undefined>;
  createDailyScore(data: InsertDailyScore): Promise<DailyScore>;

  // Supplements
  getSupplements(userId: number): Promise<Supplement[]>;
  createSupplement(data: InsertSupplement): Promise<Supplement>;
  updateSupplement(id: number, data: Partial<InsertSupplement>): Promise<Supplement | undefined>;

  // Supplement Logs
  getSupplementLogs(userId: number, date: string): Promise<SupplementLog[]>;
  createSupplementLog(data: InsertSupplementLog): Promise<SupplementLog>;
  updateSupplementLog(id: number, taken: boolean): Promise<SupplementLog | undefined>;

  // Meals
  getMeals(userId: number, date: string): Promise<Meal[]>;
  createMeal(data: InsertMeal): Promise<Meal>;
  updateMeal(id: number, data: Partial<InsertMeal>): Promise<Meal | undefined>;

  // Wellness Goals
  getWellnessGoals(userId: number): Promise<WellnessGoal[]>;
  createWellnessGoal(data: InsertWellnessGoal): Promise<WellnessGoal>;
  updateWellnessGoal(id: number, data: Partial<InsertWellnessGoal>): Promise<WellnessGoal | undefined>;
}

const sqlite = new Database("lumloop.db");
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite);

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT,
    onboarding_complete INTEGER DEFAULT 0,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    primary_goal TEXT,
    sleep_quality TEXT,
    stress_level TEXT,
    supplement_use TEXT,
    diet_style TEXT,
    exercise_frequency TEXT,
    glp1_user INTEGER DEFAULT 0,
    completed_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS daily_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    readiness INTEGER,
    bio_age REAL,
    sleep_score INTEGER,
    sleep_hours REAL,
    hrv INTEGER,
    energy_level TEXT,
    focus_score INTEGER,
    stress_level TEXT,
    cardio_age REAL,
    sleep_age REAL,
    metabolic_age REAL,
    immune_age REAL,
    muscle_age REAL
  );

  CREATE TABLE IF NOT EXISTS supplements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    dose TEXT NOT NULL,
    timing TEXT NOT NULL,
    benefit TEXT,
    form TEXT,
    category TEXT,
    confidence INTEGER,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS supplement_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    supplement_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    taken INTEGER DEFAULT 0,
    taken_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    name TEXT NOT NULL,
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fat INTEGER,
    tags TEXT,
    ai_rationale TEXT,
    logged INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS wellness_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    goal_name TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    icon TEXT
  );
`);

class SqliteStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.email, email)).get();
  }

  async createUser(data: InsertUser & { passwordHash?: string | null }): Promise<User> {
    return db.insert(users).values({
      ...data,
      passwordHash: data.passwordHash ?? null,
      onboardingComplete: false,
      createdAt: new Date(),
    }).returning().get();
  }

  async updateUser(id: number, data: any): Promise<User | undefined> {
    const rows = db.update(users).set(data).where(eq(users.id, id)).returning().all();
    return rows[0];
  }

  // Assessments
  async getAssessment(userId: number): Promise<Assessment | undefined> {
    return db.select().from(assessments).where(eq(assessments.userId, userId)).get();
  }

  async createAssessment(data: InsertAssessment): Promise<Assessment> {
    return db.insert(assessments).values({
      ...data,
      completedAt: new Date(),
    }).returning().get();
  }

  // Daily Scores
  async getDailyScores(userId: number, limit = 30): Promise<DailyScore[]> {
    return db.select().from(dailyScores)
      .where(eq(dailyScores.userId, userId))
      .orderBy(desc(dailyScores.date))
      .limit(limit)
      .all();
  }

  async getDailyScore(userId: number, date: string): Promise<DailyScore | undefined> {
    return db.select().from(dailyScores)
      .where(and(eq(dailyScores.userId, userId), eq(dailyScores.date, date)))
      .get();
  }

  async createDailyScore(data: InsertDailyScore): Promise<DailyScore> {
    return db.insert(dailyScores).values(data).returning().get();
  }

  // Supplements
  async getSupplements(userId: number): Promise<Supplement[]> {
    return db.select().from(supplements)
      .where(and(eq(supplements.userId, userId), eq(supplements.active, true)))
      .all();
  }

  async createSupplement(data: InsertSupplement): Promise<Supplement> {
    return db.insert(supplements).values(data).returning().get();
  }

  async updateSupplement(id: number, data: Partial<InsertSupplement>): Promise<Supplement | undefined> {
    const rows = db.update(supplements).set(data).where(eq(supplements.id, id)).returning().all();
    return rows[0];
  }

  // Supplement Logs
  async getSupplementLogs(userId: number, date: string): Promise<SupplementLog[]> {
    return db.select().from(supplementLogs)
      .where(and(eq(supplementLogs.userId, userId), eq(supplementLogs.date, date)))
      .all();
  }

  async createSupplementLog(data: InsertSupplementLog): Promise<SupplementLog> {
    return db.insert(supplementLogs).values({
      ...data,
      takenAt: null,
    }).returning().get();
  }

  async updateSupplementLog(id: number, taken: boolean): Promise<SupplementLog | undefined> {
    const rows = db.update(supplementLogs).set({
      taken,
      takenAt: taken ? new Date() : null,
    }).where(eq(supplementLogs.id, id)).returning().all();
    return rows[0];
  }

  // Meals
  async getMeals(userId: number, date: string): Promise<Meal[]> {
    return db.select().from(meals)
      .where(and(eq(meals.userId, userId), eq(meals.date, date)))
      .all();
  }

  async createMeal(data: InsertMeal): Promise<Meal> {
    return db.insert(meals).values(data).returning().get();
  }

  async updateMeal(id: number, data: Partial<InsertMeal>): Promise<Meal | undefined> {
    const rows = db.update(meals).set(data).where(eq(meals.id, id)).returning().all();
    return rows[0];
  }

  // Wellness Goals
  async getWellnessGoals(userId: number): Promise<WellnessGoal[]> {
    return db.select().from(wellnessGoals)
      .where(eq(wellnessGoals.userId, userId))
      .all();
  }

  async createWellnessGoal(data: InsertWellnessGoal): Promise<WellnessGoal> {
    return db.insert(wellnessGoals).values(data).returning().get();
  }

  async updateWellnessGoal(id: number, data: Partial<InsertWellnessGoal>): Promise<WellnessGoal | undefined> {
    const rows = db.update(wellnessGoals).set(data).where(eq(wellnessGoals.id, id)).returning().all();
    return rows[0];
  }
}

export const storage = new SqliteStorage();
