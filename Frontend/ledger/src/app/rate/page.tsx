"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RateNgoPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, authHeader } = useAuth();
  
  const [otp, setOtp] = useState("");
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ ngoName: string; location: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-theme flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-theme flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme mb-4">Login Required</h1>
          <p className="text-secondary mb-4">You need to be logged in to rate an NGO.</p>
          <Link href="/login?redirect=/rate" className="text-accent hover:underline">Login →</Link>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!otp.trim()) {
      setError("Please enter the OTP provided by the NGO");
      setLoading(false);
      return;
    }

    if (stars === 0) {
      setError("Please select a star rating");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader } as HeadersInit,
        body: JSON.stringify({ otp: otp.trim(), stars, comment: comment.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit rating");
        return;
      }

      setSuccess({ ngoName: data.rating.ngoName, location: data.rating.location });
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-theme flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fadeIn text-center">
          <div className="bg-card border border-theme rounded-2xl p-8">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-theme mb-2">Thank You!</h1>
            <p className="text-secondary mb-4">
              Your rating for <span className="text-theme font-medium">{success.ngoName}</span> at{" "}
              <span className="text-theme">{success.location}</span> has been submitted.
            </p>
            <div className="flex items-center justify-center gap-1 text-3xl mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= stars ? "text-amber-400" : "text-muted"}>★</span>
              ))}
            </div>
            <button
              onClick={() => router.push("/ngo/list")}
              className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90"
            >
              Browse NGOs
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-theme flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-theme mb-2">Rate an NGO</h1>
          <p className="text-secondary text-sm">Enter the OTP provided by the NGO after their event</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-theme rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm text-secondary mb-1.5">Event OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full bg-input border border-theme rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-secondary mb-3 text-center">Your Rating</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHoverStars(s)}
                  onMouseLeave={() => setHoverStars(0)}
                  className={`text-4xl transition-transform hover:scale-110 ${
                    s <= (hoverStars || stars) ? "text-amber-400" : "text-muted"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {stars > 0 && (
              <p className="text-center text-sm text-secondary mt-2">
                {stars === 1 && "Poor"}
                {stars === 2 && "Fair"}
                {stars === 3 && "Good"}
                {stars === 4 && "Very Good"}
                {stars === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-secondary mb-1.5">Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience..."
              className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/ngo/list" className="hover:text-theme">← Browse NGOs</Link>
        </p>
      </div>
    </main>
  );
}
