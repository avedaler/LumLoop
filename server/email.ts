import { Resend } from "resend";
import { storage } from "./storage";
import type { DailyScore } from "@shared/schema";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendDailyBriefing(userId: number) {
  if (!resend) {
    console.log("[email] No RESEND_API_KEY, skipping email");
    return;
  }

  const user = await storage.getUser(userId);
  if (!user?.email) return;

  const todayStr = new Date().toISOString().split("T")[0];
  const protocol = await storage.getDailyProtocol(userId, todayStr);
  const score = await storage.getDailyScore(userId, todayStr);

  if (!protocol) return;

  const protocolData = JSON.parse(protocol.protocol);

  try {
    await resend.emails.send({
      from: "LumLoop <coach@lumloop.com>",
      to: user.email,
      subject: `Your wellness protocol for ${new Date().toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}`,
      html: buildEmailHtml(user.name, protocolData, score || undefined),
    });

    await storage.createAgentAction({
      userId,
      date: todayStr,
      actionType: "email_sent",
      title: "Daily briefing sent",
      description: `Sent your daily protocol briefing to ${user.email}.`,
    });
  } catch (e: any) {
    console.error("[email] Send error:", e.message);
  }
}

function buildEmailHtml(
  name: string,
  protocol: { summary?: string; supplements?: { name: string; dose: string; timing: string }[]; meals?: { name: string; calories: number }[] },
  score?: DailyScore
): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f0f0e; color: #e0e0dc;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="font-size: 20px; color: #3aafb7; margin: 0;">LumLoop</h1>
        <p style="color: #8a8a84; font-size: 12px;">Your AI Wellness Coach</p>
      </div>
      <h2 style="font-size: 18px; color: #e0e0dc;">Good morning, ${name}</h2>
      <p style="color: #8a8a84; line-height: 1.6;">${protocol.summary || "Your daily protocol is ready."}</p>
      ${score ? `<div style="background: #171716; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="color: #3aafb7; font-size: 14px; margin: 0;">Bio Age: ${score.bioAge?.toFixed(1)} · Readiness: ${score.readiness} · HRV: ${score.hrv}ms</p>
      </div>` : ""}
      <h3 style="font-size: 14px; color: #3aafb7; text-transform: uppercase; letter-spacing: 0.1em;">Today's Supplements</h3>
      ${protocol.supplements?.map(s => `<p style="color: #e0e0dc; margin: 4px 0;">\u2610 ${s.name} — ${s.dose} (${s.timing})</p>`).join("") || ""}
      <h3 style="font-size: 14px; color: #3aafb7; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 20px;">Meals</h3>
      ${protocol.meals?.map(m => `<p style="color: #e0e0dc; margin: 4px 0;">\uD83C\uDF7D ${m.name} — ${m.calories} kcal</p>`).join("") || ""}
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://lumloop.com/app" style="display: inline-block; background: #3aafb7; color: #0f0f0e; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: 600;">Open Dashboard</a>
      </div>
      <p style="color: #5a5a56; font-size: 11px; text-align: center; margin-top: 24px;">LumLoop · AI Wellness Operating System</p>
    </div>
  `;
}
