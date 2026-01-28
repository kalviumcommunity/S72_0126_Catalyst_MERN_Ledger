"use client";
import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LocationInput from "@/components/LocationInput";

export default function ClaimLocationPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, authHeader } = useAuth();

  const [ngoName, setNgoName] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      router.push("/signup?redirect=/ngo/claim");
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading || !isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-theme flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  if (user.role !== "ngo") {
    return (
      <main className="min-h-screen bg-theme flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme mb-4">NGO Account Required</h1>
          <p className="text-secondary mb-4">Only NGO accounts can claim locations.</p>
          <Link href="/ngo/register" className="text-theme hover:underline">Register as NGO →</Link>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ngo/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader } as HeadersInit,
        body: JSON.stringify({ ngoName, location, contactNumber, description }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to claim location");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/ngo/my"), 1500);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const existingCount = user.ngos?.length || 0;

  return (
    <main className="min-h-screen bg-theme flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-theme mb-2">
            {existingCount > 0 ? "Add Location" : "Claim Location"}
          </h1>
          <p className="text-secondary text-sm">
            {existingCount > 0 ? `You have ${existingCount} location(s)` : "Register your first location"}
          </p>
        </div>

        {success ? (
          <div className="bg-card border border-theme rounded-2xl p-8 text-center">
            <div className="text-emerald-400 text-lg font-medium">Location claimed!</div>
            <p className="text-secondary text-sm mt-2">Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-theme rounded-2xl p-8 space-y-4">
            <div>
              <label className="block text-sm text-secondary mb-1.5">NGO Name</label>
              <input
                type="text"
                value={ngoName}
                onChange={(e) => setNgoName(e.target.value)}
                required
                className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <LocationInput
              value={location}
              onChange={setLocation}
              required
            />

            <div>
              <label className="block text-sm text-secondary mb-1.5">Contact Number</label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
                placeholder="+1 234 567 8900"
                className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-secondary mb-1.5">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? "Claiming..." : "Claim Location"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/ngo/my" className="hover:text-theme">← Back to My NGOs</Link>
        </p>
      </div>
    </main>
  );
}
