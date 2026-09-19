"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request OTP");
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload: Record<string, string> = { email, otp, code: otp };
      if (name.trim() !== "") payload.name = name.trim();

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");
      
      // FIX: Hard redirect forces the browser to carry the new cookie through the middleware
      window.location.href = "/report";
    } catch (err: any) {
      setError(err.message);
      setLoading(false); 
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
        <p className="text-gray-500 text-sm mb-6">
          Only verified @gvpce.ac.in addresses can sign in.
        </p>

        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0078d4]"
                placeholder="e.g., 324103383036@gvpce.ac.in"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0078d4] text-white font-medium rounded-lg p-3 hover:bg-[#005a9e] transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              We sent a 6-digit code to <strong>{email}</strong>.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">6-digit code</label>
              <input 
                type="text" 
                required 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0078d4] tracking-[0.5em] text-center text-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your name (optional)</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0078d4]"
                placeholder="e.g., Kengam Mohan Krishna"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0078d4] text-white font-medium rounded-lg p-3 hover:bg-[#005a9e] transition disabled:opacity-50 mt-2"
            >
              {loading ? "Verifying..." : "Verify & Sign in"}
            </button>
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => { setStep(1); setLoading(false); setOtp(""); }}
                className="text-sm text-[#0078d4] hover:underline"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
