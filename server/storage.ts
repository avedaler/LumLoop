import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, desc } from "drizzle-orm";
import {
  users, assessments, dailyScores, supplements, supplementLogs, meals, wellnessGoals,
  dailyCheckins, agentActions, dailyProtocols, weeklyReviews, healthMetrics, biomarkers,
  protocolAdjustments, supplementEffectiveness, subscriptions, notificationPreferences,
} from "@shared/schema";
import type {
  User, InsertUser,
  Assessment, InsertAssessment,
  DailyScore, InsertDailyScore,
  Supplement, InsertSupplement,
  SupplementLog, InsertSupplementLog,
  Meal, InsertMeal,
  WellnessGoal, InsertWellnessGoal,
  DailyCheckin, InsertDailyCheckin,
  AgentAction, InsertAgentAction,
  DailyProtocol, InsertDailyProtocol,
  WeeklyReview, InsertWeeklyReview,
  HealthMetric, InsertHealthMetric,
  Biomarker, InsertBiomarker,
  ProtocolAdjustment, InsertProtocolAdjustment,
  SupplementEffectiveness, InsertSupplementEffectiveness,
  Subscription, InsertSubscription,
  NotificationPreferences, InsertNotificationPreferences,
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

  // Daily Check-ins
  getDailyCheckin(userId: number, date: string): Promise<DailyCheckin | undefined>;
  createDailyCheckin(data: InsertDailyCheckin): Promise<DailyCheckin>;

  // Agent Actions
  getAgentActions(userId: number, limit?: number): Promise<AgentAction[]>;
  createAgentAction(data: InsertAgentAction): Promise<AgentAction>;

  // Daily Protocols
  getDailyProtocol(userId: number, date: string): Promise<DailyProtocol | undefined>;
  createDailyProtocol(data: InsertDailyProtocol): Promise<DailyProtocol>;

  // Weekly Reviews
  getWeeklyReview(userId: number, weekStart: string): Promise<WeeklyReview | undefined>;
  createWeeklyReview(data: InsertWeeklyReview): Promise<WeeklyReview>;

  // Health Metrics
  createHealthMetric(data: InsertHealthMetric): Promise<HealthMetric>;
  getHealthMetrics(userId: number, limit?: number): Promise<HealthMetric[]>;
  getHealthMetricByDate(userId: number, date: string): Promise<HealthMetric | undefined>;

  // Biomarkers
  createBiomarker(data: InsertBiomarker): Promise<Biomarker>;
  getBiomarkers(userId: number): Promise<Biomarker[]>;
  getBiomarkersByName(userId: number, name: string): Promise<Biomarker[]>;

  // Daily Score upsert
  upsertDailyScore(data: InsertDailyScore): Promise<DailyScore>;

  // Protocol Adjustments
  createProtocolAdjustment(data: InsertProtocolAdjustment): Promise<ProtocolAdjustment>;
  getProtocolAdjustments(userId: number, limit?: number): Promise<ProtocolAdjustment[]>;
  updateProtocolAdjustment(id: number, accepted: boolean): Promise<ProtocolAdjustment | undefined>;

  // Supplement Effectiveness
  createSupplementEffectiveness(data: InsertSupplementEffectiveness): Promise<SupplementEffectiveness>;
  getSupplementEffectiveness(userId: number): Promise<SupplementEffectiveness[]>;
  getLatestEffectiveness(userId: number, supplementId: number): Promise<SupplementEffectiveness | undefined>;

  // Subscriptions
  getSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(data: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription | undefined>;

  // Notification Preferences
  getNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined>;
  upsertNotificationPreferences(data: InsertNotificationPreferences): Promise<NotificationPreferences>;

  // Deactivate supplement
  deactivateSupplement(id: number): Promise<Supplement | undefined>;

  // All supplement logs for a user in a date range
  getSupplementLogsRange(userId: number, startDate: string, endDate: string): Promise<SupplementLog[]>;

  // All Users
  getAllUsers(): Promise<User[]>;

  // Admin stats
  getUserCount(): Promise<number>;
  getRecentUsers(limit: number): Promise<User[]>;
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

  CREATE TABLE IF NOT EXISTS daily_checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    sleep_quality INTEGER,
    energy_level INTEGER,
    mood INTEGER,
    stress_level INTEGER,
    notes TEXT,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS agent_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    action_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata TEXT,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS daily_protocols (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    protocol TEXT NOT NULL,
    reasoning TEXT,
    generated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS health_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    sleep_hours REAL,
    sleep_quality INTEGER,
    hrv INTEGER,
    resting_hr INTEGER,
    steps INTEGER,
    weight REAL,
    body_fat REAL,
    bp_sys INTEGER,
    bp_dia INTEGER,
    blood_glucose REAL,
    body_temp REAL,
    oxygen_sat INTEGER,
    source TEXT DEFAULT 'manual',
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS biomarkers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    reference_min REAL,
    reference_max REAL,
    status TEXT,
    notes TEXT,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS protocol_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    adjustment_type TEXT NOT NULL,
    target_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    reasoning TEXT NOT NULL,
    accepted INTEGER,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS supplement_effectiveness (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    supplement_id INTEGER NOT NULL,
    week_start TEXT NOT NULL,
    adherence_rate REAL,
    correlated_metric TEXT,
    metric_before REAL,
    metric_after REAL,
    effectiveness_score INTEGER,
    notes TEXT,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'active',
    current_period_end INTEGER,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS notification_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    email_briefing INTEGER DEFAULT 1,
    email_weekly_review INTEGER DEFAULT 1,
    supplement_reminders INTEGER DEFAULT 1,
    checkin_reminders INTEGER DEFAULT 1,
    anomaly_alerts INTEGER DEFAULT 1,
    timezone TEXT DEFAULT 'Asia/Kuala_Lumpur'
  );

  CREATE TABLE IF NOT EXISTS weekly_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    week_start TEXT NOT NULL,
    week_end TEXT NOT NULL,
    summary TEXT NOT NULL,
    insights TEXT,
    adjustments TEXT,
    overall_score INTEGER,
    created_at INTEGER
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

  // Daily Check-ins
  async getDailyCheckin(userId: number, date: string): Promise<DailyCheckin | undefined> {
    return db.select().from(dailyCheckins)
      .where(and(eq(dailyCheckins.userId, userId), eq(dailyCheckins.date, date)))
      .get();
  }

  async createDailyCheckin(data: InsertDailyCheckin): Promise<DailyCheckin> {
    return db.insert(dailyCheckins).values({
      ...data,
      createdAt: new Date(),
    }).returning().get();
  }

  // Agent Actions
  async getAgentActions(userId: number, limit = 20): Promise<AgentAction[]> {
    return db.select().from(agentActions)
      .where(eq(agentActions.userId, userId))
      .orderBy(desc(agentActions.createdAt))
      .limit(limit)
      .all();
  }

  async createAgentAction(data: InsertAgentAction): Promise<AgentAction> {
    return db.insert(agentActions).values({
      ...data,
      createdAt: new Date(),
    }).returning().get();
  }

  // Daily Protocols
  async getDailyProtocol(userId: number, date: string): Promise<DailyProtocol | undefined> {
    return db.select().from(dailyProtocols)
      .where(and(eq(dailyProtocols.userId, userId), eq(dailyProtocols.date, date)))
      .get();
  }

  async createDailyProtocol(data: InsertDailyProtocol): Promise<DailyProtocol> {
    return db.insert(dailyProtocols).values({
      ...data,
      generatedAt: new Date(),
    }).returning().get();
  }

  // Weekly Reviews
  async getWeeklyReview(userId: number, weekStart: string): Promise<WeeklyReview | undefined> {
    return db.select().from(weeklyReviews)
      .where(and(eq(weeklyReviews.userId, userId), eq(weeklyReviews.weekStart, weekStart)))
      .get();
  }

  async createWeeklyReview(data: InsertWeeklyReview): Promise<WeeklyReview> {
    return db.insert(weeklyReviews).values({
      ...data,
      createdAt: new Date(),
    }).returning().get();
  }

  // Health Metrics
  async createHealthMetric(data: InsertHealthMetric): Promise<HealthMetric> {
    return db.insert(healthMetrics).values({
      ...data,
      createdAt: new Date(),
    }).returning().get();
  }

  async getHealthMetrics(userId: number, limit = 30): Promise<HealthMetric[]> {
    return db.select().from(healthMetrics)
      .where(eq(healthMetrics.userId, userId))
      .orderBy(desc(healthMetrics.date))
      .limit(limit)
      .all();
  }

  async getHealthMetricByDate(userId: number, date: string): Promise<HealthMetric | undefined> {
    return db.select().from(healthMetrics)
      .where(and(eq(healthMetrics.userId, userId), eq(healthMetrics.date, date)))
      .get();
  }

  // Biomarkers
  async createBiomarker(data: InsertBiomarker): Promise<Biomarker> {
    return db.insert(biomarkers).values({
      ...data,
      createdAt: new Date(),
    }).returning().get();
  }

  async getBiomarkers(userId: number): Promise<Biomarker[]> {
    return db.select().from(biomarkers)
      .where(eq(biomarkers.userId, userId))
      .orderBy(desc(biomarkers.date))
      .all();
  }

  async getBiomarkersByName(userId: number, name: string): Promise<Biomarker[]> {
    return db.select().from(biomarkers)
      .where(and(eq(biomarkers.userId, userId), eq(biomarkers.name, name)))
      .orderBy(desc(biomarkers.date))
      .all();
  }

  // Daily Score upsert
  async upsertDailyScore(data: InsertDailyScore): Promise<DailyScore> {
    const existing = await this.getDailyScore(data.userId, data.date);
    if (existing) {
      const rows = db.update(dailyScores).set(data).where(eq(dailyScores.id, existing.id)).returning().all();
      return rows[0];
    }
    return db.insert(dailyScores).values(data).returning().get();
  }

  // Protocol Adjustments
  async createProtocolAdjustment(data: InsertProtocolAdjustment): Promise<ProtocolAdjustment> {
    return db.insert(protocolAdjustments).values({ ...data, createdAt: new Date() }).returning().get();
  }

  async getProtocolAdjustments(userId: number, limit = 20): Promise<ProtocolAdjustment[]> {
    return db.select().from(protocolAdjustments)
      .where(eq(protocolAdjustments.userId, userId))
      .orderBy(desc(protocolAdjustments.createdAt))
      .limit(limit).all();
  }

  async updateProtocolAdjustment(id: number, accepted: boolean): Promise<ProtocolAdjustment | undefined> {
    const rows = db.update(protocolAdjustments).set({ accepted }).where(eq(protocolAdjustments.id, id)).returning().all();
    return rows[0];
  }

  // Supplement Effectiveness
  async createSupplementEffectiveness(data: InsertSupplementEffectiveness): Promise<SupplementEffectiveness> {
    return db.insert(supplementEffectiveness).values({ ...data, createdAt: new Date() }).returning().get();
  }

  async getSupplementEffectiveness(userId: number): Promise<SupplementEffectiveness[]> {
    return db.select().from(supplementEffectiveness)
      .where(eq(supplementEffectiveness.userId, userId))
      .orderBy(desc(supplementEffectiveness.createdAt))
      .all();
  }

  async getLatestEffectiveness(userId: number, supplementId: number): Promise<SupplementEffectiveness | undefined> {
    return db.select().from(supplementEffectiveness)
      .where(and(eq(supplementEffectiveness.userId, userId), eq(supplementEffectiveness.supplementId, supplementId)))
      .orderBy(desc(supplementEffectiveness.weekStart))
      .get();
  }

  // Subscriptions
  async getSubscription(userId: number): Promise<Subscription | undefined> {
    return db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).get();
  }

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    return db.insert(subscriptions).values({ ...data, createdAt: new Date() }).returning().get();
  }

  async updateSubscription(id: number, data: any): Promise<Subscription | undefined> {
    const rows = db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning().all();
    return rows[0];
  }

  // Notification Preferences
  async getNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined> {
    return db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).get();
  }

  async upsertNotificationPreferences(data: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const existing = await this.getNotificationPreferences(data.userId);
    if (existing) {
      const rows = db.update(notificationPreferences).set(data).where(eq(notificationPreferences.id, existing.id)).returning().all();
      return rows[0];
    }
    return db.insert(notificationPreferences).values(data).returning().get();
  }

  // Deactivate supplement
  async deactivateSupplement(id: number): Promise<Supplement | undefined> {
    const rows = db.update(supplements).set({ active: false }).where(eq(supplements.id, id)).returning().all();
    return rows[0];
  }

  // Supplement logs in date range
  async getSupplementLogsRange(userId: number, startDate: string, endDate: string): Promise<SupplementLog[]> {
    return db.select().from(supplementLogs)
      .where(eq(supplementLogs.userId, userId))
      .all()
      .filter(l => l.date >= startDate && l.date <= endDate);
  }

  // All Users
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).all();
  }

  // Admin stats
  async getUserCount(): Promise<number> {
    return db.select().from(users).all().length;
  }

  async getRecentUsers(limit: number): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).all();
  }
}

export const storage = new SqliteStorage();
