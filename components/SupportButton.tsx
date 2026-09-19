"use client";
import { useState } from "react";
import { ThumbsUp } from "lucide-react";
export function SupportButton({ issueId }: { issueId: string }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  async function support() {
    setBusy(true);
    const res = await fetch(`/api/issues/${issueId}/support`, { method: "POST" });
    setBusy(false);
    if (res.ok) setDone(true);
  }
  return (
    <button onClick={support} disabled={busy || done} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-4 font-semibold text-white disabled:opacity-50">
      <ThumbsUp className="h-5 w-5" />
      {done ? "Supporting" : busy ? "Sendingâ€¦" : "Support this issue"}
    </button>
  );
}