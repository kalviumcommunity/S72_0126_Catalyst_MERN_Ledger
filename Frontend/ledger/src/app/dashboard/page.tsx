"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface RatingStats {
  average: number;
  count: number;
}

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout, authHeader } = useAuth();
  const [ratings, setRatings] = useState<Record<number, RatingStats>>({});

  const fetchRatings = useCallback(async (ngoId: number) => {
    try {
      const res = await fetch(`/api/ratings?ngoId=${ngoId}`);
      if (res.ok) {
        const data = await res.json();
        setRatings(prev => ({ ...prev, [ngoId]: data.stats }));
      }
    } catch (err) {
      console.error("Failed to fetch ratings:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === "ngo" && user.ngos) {
      user.ngos.forEach(ngo => fetchRatings(ngo.id));
    }
  }, [isAuthenticated, user, fetchRatings, authHeader]);

  if (loading) {
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
          <h1 className="text-2xl font-bold text-theme mb-4">Please Login</h1>
          <Link href="/login" className="text-secondary hover:text-theme">Go to Login →</Link>
        </div>
      </main>
    );
  }

  const isNgo = user.role === "ngo";
  const ngos = user.ngos || [];

  return (
    <main className="min-h-screen bg-theme">
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-theme mb-2">Dashboard</h1>
            <p className="text-secondary">Welcome back, <span className="text-theme">{user.name}</span></p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-input text-secondary rounded-lg hover:opacity-80 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* User Card */}
        <div className="bg-card border border-theme rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-input flex items-center justify-center text-xl font-bold text-theme">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-theme">{user.name}</p>
              <p className="text-sm text-secondary">{user.email}</p>
              <span className={`inline-flex mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                isNgo ? "bg-emerald-500/20 text-emerald-400" : "bg-input text-secondary"
              }`}>
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* NGO Locations */}
        {isNgo && (
          <div className="bg-card border border-theme rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-theme">Your Locations</h2>
              <Link
                href="/ngo/claim"
                className="px-3 py-1.5 bg-accent text-accent-foreground text-sm rounded-lg hover:opacity-90 transition-colors"
              >
                + Add
              </Link>
            </div>
            
            {ngos.length === 0 ? (
              <p className="text-muted">No locations registered yet.</p>
            ) : (
              <div className="space-y-3">
                {ngos.map((ngo) => {
                  const ngoRating = ratings[ngo.id];
                  return (
                  <div key={ngo.id} className="bg-input rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-theme">{ngo.name}</h3>
                        <p className="text-sm text-secondary">{ngo.location}</p>
                        {ngo.description && <p className="text-sm text-muted mt-1">{ngo.description}</p>}
                      </div>
                      {ngoRating && (
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-amber-400">★</span>
                            <span className="text-theme font-medium">{ngoRating.average.toFixed(1)}</span>
                          </div>
                          <span className="text-xs text-muted">({ngoRating.count} ratings)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
                })}
              </div>
            )}
            
            {ngos.length > 0 && (
              <Link href="/ngo/my" className="inline-block mt-4 text-secondary hover:text-theme text-sm">
                Manage locations →
              </Link>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-card border border-theme rounded-xl p-6">
          <h2 className="text-lg font-semibold text-theme mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/ngo/list"
              className="flex items-center justify-between p-4 bg-input hover:opacity-80 rounded-lg transition-colors"
            >
              <span className="text-theme">Browse All NGOs</span>
              <span className="text-muted">→</span>
            </Link>
            {!isNgo && (
              <Link
                href="/rate"
                className="flex items-center justify-between p-4 bg-input hover:opacity-80 rounded-lg transition-colors"
              >
                <span className="text-theme">★ Rate an NGO</span>
                <span className="text-muted">→</span>
              </Link>
            )}
            {isNgo && (
              <>
              <Link
                href="/ngo/claim"
                className="flex items-center justify-between p-4 bg-input hover:opacity-80 rounded-lg transition-colors"
              >
                <span className="text-theme">Claim New Location</span>
                <span className="text-muted">→</span>
              </Link>
              <Link
                href="/ngo/my"
                className="flex items-center justify-between p-4 bg-input hover:opacity-80 rounded-lg transition-colors"
              >
                <span className="text-theme">Manage Locations & Generate OTP</span>
                <span className="text-muted">→</span>
              </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
