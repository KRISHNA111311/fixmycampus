import type { Severity } from "@/types";
const W: Record<Severity, number> = { LOW: 10, MEDIUM: 30, HIGH: 60, CRITICAL: 85 };
const HOT = ["hostel","library","auditorium","laboratory","lab","washroom","toilet","canteen"];
export function computeImpact(i: {
  severity: Severity; affectedUsers: number; supporters: number;
  hoursUnresolved: number; repeatsIn90d: number; locationDisplayName: string;
}) {
  const reasons: string[] = [`${i.severity} severity`];
  let s = W[i.severity];
  const a = Math.min(15, Math.log2(1 + i.affectedUsers) * 3);
  if (a > 1) reasons.push(`${i.affectedUsers} affected users`);
  s += a;
  const p = Math.min(10, Math.log2(1 + i.supporters) * 2.5);
  if (p > 1) reasons.push(`${i.supporters} supporters`);
  s += p;
  const t = Math.min(10, i.hoursUnresolved / 12);
  if (t > 2) reasons.push("aged without resolution");
  s += t;
  if (i.repeatsIn90d >= 2) { s += Math.min(10, i.repeatsIn90d * 2); reasons.push(`repeated ${i.repeatsIn90d}x in 90 days`); }
  if (HOT.some(k => i.locationDisplayName.toLowerCase().includes(k))) { s += 5; reasons.push("high-traffic location"); }
  return { score: Math.max(0, Math.min(100, Math.round(s))), reasons };
}