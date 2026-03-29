import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";

const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
const client = hasApiKey ? new Anthropic() : null;

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

async function generateFallbackResponse(message: string, userId: number): Promise<string> {
  const lower = message.toLowerCase();
  const user = await storage.getUser(userId);
  const name = user?.name ? user.name.split(" ")[0] : "";
  const greeting = name ? `${name}, ` : "";

  if (lower.includes("ashwagandha")) {
    return `${greeting}Ashwagandha KSM-66 was included in your protocol for cortisol management and stress recovery. It works by modulating your HPA axis — the system that regulates cortisol release. The 600mg evening dose is timed to support your natural cortisol wind-down before sleep. Your HRV data shows improvement since adding it, which suggests your parasympathetic nervous system is recovering more efficiently. Keep taking it consistently for 8-12 weeks for full adaptogenic effects.`;
  }

  if (lower.includes("sleep")) {
    return `${greeting}based on your sleep data, here are my top recommendations: First, maintain consistent sleep and wake times — even on weekends. Your circadian rhythm responds strongly to regularity. Second, your Ashwagandha and Magnesium L-Threonate are both supporting sleep architecture. Take the magnesium 30-60 minutes before bed. Third, limit blue light exposure 2 hours before sleep, and keep your bedroom at 65-68°F. Your current sleep score suggests you're on the right track — focus on consistency.`;
  }

  if (lower.includes("bio") && (lower.includes("age") || lower.includes("logical"))) {
    return `${greeting}your biological age is a composite metric that reflects how your body is aging relative to your chronological age. It's calculated from multiple biomarkers including HRV, sleep quality, metabolic markers, cardiovascular fitness, and immune function. Each organ system ages at its own rate — which is why you see different ages for cardio, sleep, metabolic, immune, and muscle systems. The good news: biological age is modifiable. Your supplement protocol, sleep optimization, and stress management are all working to bring your bio age down. Focus on the systems with the highest ages for the most impact.`;
  }

  if (lower.includes("supplement") && lower.includes("interact")) {
    return `${greeting}your current stack has excellent synergy with no concerning interactions. Omega-3 and Vitamin D3 are both fat-soluble — taking them with meals enhances absorption. Magnesium L-Threonate and Ashwagandha work complementarily for stress and sleep. NMN is best taken fasted in the morning for optimal NAD+ synthesis. Creatine has no timing sensitivity. The one consideration: space your Magnesium from your Omega-3 by about 2 hours if possible, as high-dose magnesium can slightly reduce fat absorption.`;
  }

  if (lower.includes("eat") || lower.includes("food") || lower.includes("nutrition") || lower.includes("workout") || lower.includes("diet")) {
    return `${greeting}for pre-workout nutrition, focus on easily digestible carbs with moderate protein 60-90 minutes before training. A banana with almond butter, or oatmeal with berries works well. Post-workout, prioritize protein (30-40g) within 2 hours. Your creatine supplement supports ATP production regardless of meal timing. For overall nutrition, emphasize anti-inflammatory foods: wild-caught fish, leafy greens, berries, and olive oil. These complement your Omega-3 and turmeric intake for optimal recovery.`;
  }

  if (lower.includes("cold") || lower.includes("ice") || lower.includes("cryo")) {
    return `${greeting}cold exposure is a powerful tool for recovery and metabolic health. For optimal results, aim for 2-3 minutes at 50-59°F (cold shower) or 1-2 minutes if using ice bath. Best timing: morning for energy and dopamine boost, or post-workout for recovery (but wait 4+ hours after strength training to avoid blunting hypertrophy). Cold exposure increases norepinephrine by 200-300%, improves HRV over time, and supports brown fat activation. Start gradually — even 30 seconds of cold at the end of your shower provides benefits.`;
  }

  if (lower.includes("hrv") || lower.includes("heart rate variability")) {
    return `${greeting}HRV is one of the most reliable markers of your autonomic nervous system health. Higher HRV generally indicates better recovery, lower stress, and greater resilience. Your protocol is well-designed to support HRV: Ashwagandha reduces cortisol, Omega-3s support cardiac function, and Magnesium helps with parasympathetic activation. To maximize HRV: prioritize consistent sleep timing, practice nasal breathing during exercise, and consider adding 5-10 minutes of box breathing before bed.`;
  }

  if (lower.includes("energy") || lower.includes("fatigue") || lower.includes("tired")) {
    return `${greeting}sustained energy comes from optimizing multiple systems simultaneously. Your NMN supports cellular energy production via NAD+, while Creatine provides ATP for both cognitive and physical performance. For natural energy: prioritize morning sunlight exposure (10-15 min), maintain blood sugar stability with protein-forward meals, stay hydrated (aim for half your body weight in ounces), and time your caffeine intake 90 minutes after waking for optimal cortisol alignment. Your current energy levels look strong — these habits will maintain that trajectory.`;
  }

  if (lower.includes("stress") || lower.includes("cortisol") || lower.includes("anxious")) {
    return `${greeting}managing cortisol is key to long-term health optimization. Your Ashwagandha KSM-66 is working on this at the biochemical level. Complement it with these practices: try 5-5-5 box breathing (5 sec inhale, 5 sec hold, 5 sec exhale) during stressful moments. Schedule a 10-minute walk after lunch to break up cortisol accumulation. Consider a brief cold exposure in the morning for stress resilience training. Your HRV data will reflect improvements in stress management within 1-2 weeks of consistent practice.`;
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return `${greeting}welcome! I'm your LumLoop wellness coach. I can help you understand your supplements, optimize your sleep, interpret your biomarkers, and design nutrition strategies. I have access to your bio age data, supplement stack, and daily health metrics. What would you like to focus on today?`;
  }

  return `${greeting}I can help with a wide range of wellness topics including supplement optimization, sleep improvement, nutrition strategies, stress management, cold exposure protocols, biomarker interpretation, and biological age reduction. I have access to your health data, supplement stack, and wellness goals. What specific area would you like to explore?`;
}

export async function generateCoachResponse(
  userId: number,
  userMessage: string,
  conversationHistory: { role: string; content: string }[]
): Promise<string> {
  if (!hasApiKey || !client) {
    return generateFallbackResponse(userMessage, userId);
  }

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
    return generateFallbackResponse(userMessage, userId);
  }
}
