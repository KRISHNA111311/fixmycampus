import { GoogleGenAI } from "@google/genai";
import type { AiAnalysis, Severity } from "@/types";
const apiKey = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
let client: GoogleGenAI | null = null;
function getClient() {
  if (!apiKey) return null;
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}
const SEV: Severity[] = ["LOW","MEDIUM","HIGH","CRITICAL"];
const PROMPT = `Analyse the campus-issue photo. Only describe what is visually supported.
Separate visibleObservation (facts) from possibleConsequence (inference). Do not invent facts.
Return STRICT JSON only:
{"object":string,"problem":string,"category":"Electrical"|"Plumbing"|"Cleanliness"|"Infrastructure"|"Furniture"|"Network"|"HVAC"|"Safety"|"Hostel"|"Laboratory"|"Washroom"|"Other","subcategory":string,"severitySuggestion":"LOW"|"MEDIUM"|"HIGH"|"CRITICAL","safetyRisk":boolean,"departmentSuggestion":string,"description":string,"visibleObservation":string,"possibleConsequence":string,"confidence":number,"uncertainties":string[]}`;
function parse(raw: string) {
  const t = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(t); } catch {
    const m = t.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try { return JSON.parse(m[0]); } catch { return null; }
  }
}
export async function analyzeImage(base64: string, mimeType: string): Promise<AiAnalysis | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const res = await c.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [
        { text: PROMPT },
        { inlineData: { mimeType, data: base64 } }
      ]}],
      config: { responseMimeType: "application/json", temperature: 0.2 }
    });
    const parsed = parse(res.text ?? "");
    if (!parsed) return null;
    const sev: Severity = SEV.includes(parsed.severitySuggestion) ? parsed.severitySuggestion : "MEDIUM";
    return {
      object: String(parsed.object ?? "unknown"),
      problem: String(parsed.problem ?? ""),
      category: String(parsed.category ?? "Other"),
      subcategory: parsed.subcategory ? String(parsed.subcategory) : undefined,
      severitySuggestion: sev,
      safetyRisk: Boolean(parsed.safetyRisk),
      departmentSuggestion: parsed.departmentSuggestion ? String(parsed.departmentSuggestion) : undefined,
      description: String(parsed.description ?? ""),
      visibleObservation: parsed.visibleObservation ? String(parsed.visibleObservation) : undefined,
      possibleConsequence: parsed.possibleConsequence ? String(parsed.possibleConsequence) : undefined,
      confidence: typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      uncertainties: Array.isArray(parsed.uncertainties) ? parsed.uncertainties.map(String).slice(0, 6) : []
    };
  } catch (e) { console.error("[gemini] failed:", e); return null; }
}