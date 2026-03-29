import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the LumLoop AI Wellness Coach — a world-class health optimization advisor built into a premium wellness operating system.

Your personality:
- Calm, precise, and encouraging — like a top longevity doctor who is also warm and approachable
- Evidence-informed but not overly clinical — cite mechanisms, not studies
- Concise — keep responses under 150 words unless the user asks for detail
- Action-oriented — every response should end with a specific actionable recommendation
- Premium tone — you represent a luxury wellness brand, not a generic chatbot

Your knowledge:
- Supplement science (mechanisms, timing, interactions, dosing)
- Sleep optimization (circadian rhythm, sleep architecture, HRV correlation)
- Nutrition for performance (anti-inflammatory, metabolic health, recovery)
- Stress management (cortisol patterns, HRV, breathwork, cold exposure)
- Recovery protocols (cryotherapy, sauna, massage, active recovery)
- Biomarker interpretation (cortisol, vitamin D, hs-CRP, HbA1c, lipids, hormones)
- GLP-1 medication support (muscle preservation, micronutrient needs, side effects)
- Biological age concepts (composite wellness age, organ-specific aging)

Rules:
- NEVER diagnose medical conditions or recommend prescription medications
- NEVER say "I'm just an AI" — you are the LumLoop Coach, a premium wellness advisor
- Always frame advice as "wellness optimization" not medical treatment
- If a user describes serious symptoms, recommend they consult a healthcare provider
- Reference the user's data when available (bio age, HRV, sleep, supplements)
- Use the user's name when you have it`;

export async function generateCoachResponse(
  userId: number,
  userMessage: string,
  conversationHistory: { role: string; content: string }[]
): Promise<string> {
  // Gather user context
  const user = await storage.getUser(userId);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayScore = await storage.getDailyScore(userId, todayStr);
  const supplements = await storage.getSupplements(userId);
  const suppLogs = await storage.getSupplementLogs(userId, todayStr);
  const assessment = await storage.getAssessment(userId);
  const goals = await storage.getWellnessGoals(userId);

  // Build context string
  const takenCount = suppLogs.filter(l => l.taken).length;
  const contextParts: string[] = [];

  if (user) contextParts.push(`User: ${user.name}`);
  if (assessment?.primaryGoal) contextParts.push(`Primary goal: ${assessment.primaryGoal}`);
  if (todayScore) {
    contextParts.push(`Today's data: Bio Age ${todayScore.bioAge?.toFixed(1)}, Readiness ${todayScore.readiness}/100, HRV ${todayScore.hrv}ms, Sleep ${todayScore.sleepHours?.toFixed(1)}h (${todayScore.sleepScore}%), Energy: ${todayScore.energyLevel}, Focus: ${todayScore.focusScore}, Stress: ${todayScore.stressLevel}`);
  }
  if (supplements.length > 0) {
    contextParts.push(`Supplement stack (${takenCount}/${supplements.length} taken today): ${supplements.map(s => `${s.name} ${s.dose} (${s.timing})`).join(", ")}`);
  }
  if (goals.length > 0) {
    contextParts.push(`Wellness goals: ${goals.map(g => `${g.goalName} (${g.progress}%)`).join(", ")}`);
  }
  if (assessment?.glp1User) {
    contextParts.push("Note: User is on GLP-1 medication — prioritize muscle preservation and micronutrient advice");
  }

  const userContext = contextParts.length > 0
    ? `\n\nCurrent user context:\n${contextParts.join("\n")}`
    : "";

  // Build messages
  const messages: { role: "user" | "assistant"; content: string }[] = [];

  // Include recent conversation history (last 10 messages)
  for (const msg of conversationHistory.slice(-10)) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    });
  }

  // Add current message
  messages.push({ role: "user", content: userMessage });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: SYSTEM_PROMPT + userContext,
      messages,
    });

    const textBlock = response.content.find(b => b.type === "text");
    return textBlock?.text || "I'm here to help with your wellness journey. What would you like to know?";
  } catch (error: any) {
    console.error("AI Coach error:", error.message);
    return "I'm having trouble connecting right now. Try asking me again in a moment.";
  }
}
