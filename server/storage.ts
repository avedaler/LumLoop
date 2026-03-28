import {
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
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser & { onboardingComplete: boolean }>): Promise<User | undefined>;

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

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private assessments: Map<number, Assessment> = new Map();
  private dailyScores: Map<number, DailyScore> = new Map();
  private supplements: Map<number, Supplement> = new Map();
  private supplementLogs: Map<number, SupplementLog> = new Map();
  private meals: Map<number, Meal> = new Map();
  private wellnessGoals: Map<number, WellnessGoal> = new Map();
  private nextId = 1;

  private getId() { return this.nextId++; }

  // Users
  async getUser(id: number) { return this.users.get(id); }
  async getUserByEmail(email: string) {
    return Array.from(this.users.values()).find(u => u.email === email);
  }
  async createUser(data: InsertUser): Promise<User> {
    const user: User = { id: this.getId(), ...data, onboardingComplete: false, createdAt: new Date() };
    this.users.set(user.id, user);
    return user;
  }
  async updateUser(id: number, data: any) {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  // Assessments
  async getAssessment(userId: number) {
    return Array.from(this.assessments.values()).find(a => a.userId === userId);
  }
  async createAssessment(data: InsertAssessment): Promise<Assessment> {
    const a: Assessment = { id: this.getId(), ...data, completedAt: new Date() };
    this.assessments.set(a.id, a);
    return a;
  }

  // Daily Scores
  async getDailyScores(userId: number, limit = 30) {
    return Array.from(this.dailyScores.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }
  async getDailyScore(userId: number, date: string) {
    return Array.from(this.dailyScores.values()).find(s => s.userId === userId && s.date === date);
  }
  async createDailyScore(data: InsertDailyScore): Promise<DailyScore> {
    const s: DailyScore = { id: this.getId(), ...data };
    this.dailyScores.set(s.id, s);
    return s;
  }

  // Supplements
  async getSupplements(userId: number) {
    return Array.from(this.supplements.values()).filter(s => s.userId === userId && s.active);
  }
  async createSupplement(data: InsertSupplement): Promise<Supplement> {
    const s: Supplement = { id: this.getId(), ...data };
    this.supplements.set(s.id, s);
    return s;
  }
  async updateSupplement(id: number, data: any) {
    const s = this.supplements.get(id);
    if (!s) return undefined;
    const updated = { ...s, ...data };
    this.supplements.set(id, updated);
    return updated;
  }

  // Supplement Logs
  async getSupplementLogs(userId: number, date: string) {
    return Array.from(this.supplementLogs.values()).filter(l => l.userId === userId && l.date === date);
  }
  async createSupplementLog(data: InsertSupplementLog): Promise<SupplementLog> {
    const l: SupplementLog = { id: this.getId(), ...data, takenAt: null };
    this.supplementLogs.set(l.id, l);
    return l;
  }
  async updateSupplementLog(id: number, taken: boolean) {
    const l = this.supplementLogs.get(id);
    if (!l) return undefined;
    const updated = { ...l, taken, takenAt: taken ? new Date() : null };
    this.supplementLogs.set(id, updated);
    return updated;
  }

  // Meals
  async getMeals(userId: number, date: string) {
    return Array.from(this.meals.values()).filter(m => m.userId === userId && m.date === date);
  }
  async createMeal(data: InsertMeal): Promise<Meal> {
    const m: Meal = { id: this.getId(), ...data };
    this.meals.set(m.id, m);
    return m;
  }
  async updateMeal(id: number, data: any) {
    const m = this.meals.get(id);
    if (!m) return undefined;
    const updated = { ...m, ...data };
    this.meals.set(id, updated);
    return updated;
  }

  // Wellness Goals
  async getWellnessGoals(userId: number) {
    return Array.from(this.wellnessGoals.values()).filter(g => g.userId === userId);
  }
  async createWellnessGoal(data: InsertWellnessGoal): Promise<WellnessGoal> {
    const g: WellnessGoal = { id: this.getId(), ...data };
    this.wellnessGoals.set(g.id, g);
    return g;
  }
  async updateWellnessGoal(id: number, data: any) {
    const g = this.wellnessGoals.get(id);
    if (!g) return undefined;
    const updated = { ...g, ...data };
    this.wellnessGoals.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
