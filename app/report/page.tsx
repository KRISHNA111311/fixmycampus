"use client";
import { useEffect, useState } from "react";
import { Camera, MapPin, Search, Loader2, CheckCircle2 } from "lucide-react";

type Analysis = { object: string; problem: string; category: string; severitySuggestion: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"; safetyRisk: boolean; description: string; confidence: number; uncertainties: string[] };
type Location = { kind: "ROOM"|"BUILDING"|"FACILITY"|"HOSTEL"|"OUTDOOR"|"MAP_POINT"; buildingCode?: string; roomNumber?: string; displayName: string; department?: string; roomType?: string; placeName?: string; source: "USER_SELECTED_ROOM"|"USER_SELECTED_PLACE"|"GPS"|"MAP_POINT" };
type Candidate = { _id: string; title: string; status: string; severity: string; displayName: string; supporters: number; score: number };

export default function ReportPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [severity, setSeverity] = useState<"LOW"|"MEDIUM"|"HIGH"|"CRITICAL">("MEDIUM");
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [dupChecked, setDupChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [issueCode, setIssueCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(f: File) {
    setPreview(URL.createObjectURL(f)); setAnalysis(null); setAiError(null); setAnalyzing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => setBase64Image(e.target?.result as string);
    reader.readAsDataURL(f);

    const fd = new FormData(); fd.append("image", f);
    const res = await fetch("/api/issues/analyze-image", { method: "POST", body: fd });
    setAnalyzing(false);
    
    if (res.status === 503) { setAiError("AI analysis is temporarily unavailable. Continue manually."); return; }
    if (!res.ok) { setAiError("Couldn't analyse the image. Continue manually."); return; }
    
    const data = await res.json();
    const a = data.analysis as Analysis;
    setAnalysis(a); setCategory(a.category ?? "Other");
    setSeverity(a.severitySuggestion ?? "MEDIUM"); setDescription(a.description ?? "");
  }

  // Restore Duplicate Checking
  useEffect(() => {
    if (!location || description.trim().length < 3) { setCandidates([]); setDupChecked(false); return; }
    const id = setTimeout(async () => {
      const res = await fetch("/api/issues/check-duplicates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description, category, location }) });
      if (!res.ok) return;
      const d = await res.json(); setCandidates(d.candidates ?? []); setDupChecked(true);
    }, 600); return () => clearTimeout(id);
  }, [location, description, category]);

  async function submit() {
    if (!location) { setError("Please select a location."); return; }
    setSubmitting(true); setError(null);
    
    const res = await fetch("/api/issues", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ 
        title: analysis?.problem || description.slice(0, 80) || "Reported issue", 
        description: description || analysis?.description || "No description provided.", 
        category, severity, affectedUsers: 1, location, 
        images: base64Image ? [base64Image] : [], 
        ai: analysis ? { object: analysis.object, problem: analysis.problem, categorySuggestion: analysis.category, severitySuggestion: analysis.severitySuggestion, safetyRisk: analysis.safetyRisk, confidence: analysis.confidence, generatedDescription: analysis.description, uncertainties: analysis.uncertainties } : undefined 
      }) 
    });
    
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Could not submit issue"); setSubmitting(false); return; }
    const d = await res.json(); setIssueCode(d.issue.issueCode);
  }

  if (issueCode) {
    return (
      <div className="mx-auto max-w-md space-y-6 pt-12 text-center fade-in">
        <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4 shadow-sm"><CheckCircle2 className="h-16 w-16 text-green-600" /></div>
        <h1 className="text-3xl font-extrabold text-gray-900">Report Submitted</h1>
        <p className="text-gray-500 text-lg">Your Issue ID is:</p>
        <div className="bg-white border-2 border-dashed border-gray-300 py-4 px-8 rounded-2xl inline-block"><p className="text-4xl font-mono font-bold tracking-wider text-[#0078d4]">{issueCode}</p></div>
        <div className="pt-8"><button onClick={() => window.location.href = "/"} className="w-full rounded-xl bg-[#0078d4] px-6 py-4 font-bold text-white shadow-lg hover:bg-[#005a9e] transition-all">Done</button></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-2xl mx-auto">
      <header className="pt-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Report a Problem</h1>
      </header>
      
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">1</span> Capture Evidence</h2>
        {preview ? (
          <div className="space-y-4">
            <img src={preview} alt="Captured issue" className="w-full object-cover max-h-72 rounded-2xl shadow-inner border border-gray-200" />
            {analyzing && <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl font-medium"><Loader2 className="h-5 w-5 animate-spin" />Analyzing with AI...</div>}
          </div>
        ) : (
          <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-600 p-6">
            <div className="p-4 bg-white rounded-full shadow-sm"><Camera className="h-8 w-8" /></div>
            <span className="font-semibold text-lg">Tap to take a photo</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
          </label>
        )}
      </section>

      {analysis && (
        <section className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm animate-in slide-in-from-bottom-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">2</span> Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">Category</span>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                {["Electrical","Plumbing","Cleanliness","Infrastructure","Furniture","Network","HVAC","Safety","Hostel","Laboratory","Washroom","Other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">Severity</span>
              <select value={severity} onChange={e => setSeverity(e.target.value as any)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                {["LOW","MEDIUM","HIGH","CRITICAL"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">Description</span>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </label>
        </section>
      )}

      <LocationPicker value={location} onChange={setLocation} />

      {/* Restored Duplicate UI */}
      {dupChecked && candidates.length > 0 && (
        <section className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50 p-6 animate-in slide-in-from-bottom-2">
          <h2 className="font-bold text-amber-900 flex items-center gap-2">⚠️ Similar Issues Found</h2>
          <p className="text-sm text-amber-800">Someone might have already reported this.</p>
          {candidates.map(c => (
            <div key={c._id} className="rounded-xl bg-white p-4 shadow-sm border border-amber-100">
              <div className="font-bold text-gray-900">{c.title}</div>
              <div className="text-sm text-gray-500 mt-1">{c.displayName} • {c.severity} • {c.status} • {c.supporters} supporters</div>
              <button onClick={async () => { await fetch(`/api/issues/${c._id}/support`, { method: "POST" }); window.location.href = "/"; }} className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition-colors px-4 py-2 text-sm font-bold text-white w-full">Support Existing Issue</button>
            </div>
          ))}
        </section>
      )}

      <div className="pt-4 sticky bottom-0 bg-white/90 backdrop-blur-sm">
        {error && <p className="mb-3 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg text-center">{error}</p>}
        <button onClick={submit} disabled={submitting || !location} className="w-full rounded-2xl bg-[#0078d4] px-6 py-4 text-lg font-bold text-white shadow-xl hover:bg-[#005a9e] disabled:opacity-50 transition-all">
          {submitting ? "Submitting securely..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}

function LocationPicker({ value, onChange }: { value: Location | null; onChange: (l: Location) => void }) {
  const [mode, setMode] = useState<"menu"|"room"|"place">("menu");
  const [buildings, setBuildings] = useState<{ code: string; name?: string }[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [building, setBuilding] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (mode === "room" && buildings.length === 0) fetch("/api/locations/buildings").then(r => r.json()).then(d => setBuildings(d.buildings ?? []));
    if (mode === "place" && places.length === 0) fetch("/api/locations/campus-places").then(r => r.json()).then(d => setPlaces(d.places ?? []));
  }, [mode, buildings.length, places.length]);

  useEffect(() => {
    if (mode !== "room" || !building) return;
    fetch(`/api/locations/rooms?building=${encodeURIComponent(building)}`).then(r => r.json()).then(d => setRooms(d.rooms ?? []));
  }, [building, mode]);

  return (
    <section className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">3</span> Pinpoint Location</h2>
      
      {value && (
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex items-center gap-3">
          <MapPin className="text-blue-600 h-6 w-6 shrink-0" />
          <div>
            <div className="font-bold text-gray-900">{value.displayName}</div>
            {value.department && <div className="text-sm text-gray-600">{value.department}{value.roomType ? ` • ${value.roomType}` : ""}</div>}
          </div>
        </div>
      )}

      {mode === "menu" && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => setMode("room")} className="rounded-xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 p-4 text-left transition-all">
            <span className="font-semibold text-gray-700">Block & Room</span>
          </button>
          <button onClick={() => setMode("place")} className="rounded-xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 p-4 text-left transition-all">
            <span className="font-semibold text-gray-700">Campus Places</span>
          </button>
        </div>
      )}

      {mode === "room" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
            {buildings.map(b => (
              <button key={b.code} onClick={() => setBuilding(b.code)} className={`rounded-xl px-4 py-2 text-sm font-bold ${building === b.code ? "bg-[#0078d4] text-white shadow-md" : "bg-gray-100 text-gray-600"}`}>{b.code}</button>
            ))}
          </div>
          {building && (
            <div className="space-y-3 pt-2">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder={`Search rooms in ${building}...`} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
                {rooms.filter(r => !q || r.displayName.toLowerCase().includes(q.toLowerCase())).map(r => (
                  <button key={r._id} onClick={() => onChange({ kind: "ROOM", buildingCode: r.buildingCode, roomNumber: r.roomNumber, displayName: r.displayName, department: r.department, roomType: r.roomType, source: "USER_SELECTED_ROOM" })} className="rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 p-3 text-left">
                    <div className="font-bold text-gray-900">{r.displayName}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => setMode("menu")} className="text-sm font-bold text-gray-500 pt-2">← Back</button>
        </div>
      )}

      {mode === "place" && (
        <div className="space-y-4">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search Hostels, Grounds, Canteens..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-1">
            {places.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase())).map(p => (
              <button key={p._id} onClick={() => onChange({ kind: p.kind ?? "FACILITY", displayName: p.name, placeName: p.name, source: "USER_SELECTED_PLACE" })} className="rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 p-3 text-left flex justify-between items-center">
                <span className="font-bold text-gray-900">{p.name}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">{p.kind}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setMode("menu")} className="text-sm font-bold text-gray-500 pt-2">← Back</button>
        </div>
      )}
    </section>
  );
}
