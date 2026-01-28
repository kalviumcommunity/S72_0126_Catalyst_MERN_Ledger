"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface Ngo {
  id: number;
  name: string;
  location: string;
  description?: string | null;
  accountOwner?: { name: string; email: string };
  rating?: { average: number; count: number };
}

export default function NgoListPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNgo = user?.role === "ngo";

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const response = await fetch("/api/ngos");
        const payload = await response.json();
        if (!response.ok) {
          setError(payload?.message || "Failed to load NGO list");
          return;
        }
        setNgos(payload.ngos || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchNgos();
  }, []);

  return (
    <main className="min-h-screen bg-theme">
      <div className="max-w-5xl mx-auto px-6 py-12 animate-fadeIn">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2">Directory</p>
          <h1 className="text-3xl font-bold text-theme mb-2">Registered NGOs</h1>
          <p className="text-secondary text-sm">Each location can only be held by one organization.</p>
        </div>

        <div className="flex gap-3 text-sm mb-6">
          {!authLoading && (
            <>
              {!isAuthenticated && (
                <>
                  <Link href="/ngo/register" className="text-secondary hover:text-theme transition-colors">Register as NGO</Link>
                  <span className="text-muted">·</span>
                  <Link href="/login" className="text-secondary hover:text-theme transition-colors">Login</Link>
                </>
              )}
              {isAuthenticated && !isNgo && (
                <>
                  <Link href="/rate" className="text-amber-400 hover:text-amber-300 transition-colors">★ Rate an NGO</Link>
                </>
              )}
              {isNgo && (
                <>
                  <Link href="/ngo/claim" className="text-emerald-400 hover:text-emerald-300 transition-colors">+ Add Location</Link>
                  <span className="text-muted">·</span>
                  <Link href="/ngo/my" className="text-secondary hover:text-theme transition-colors">My Locations</Link>
                </>
              )}
            </>
          )}
        </div>

        <div className="bg-card border border-theme rounded-xl overflow-hidden">
          <div className="border-b border-theme px-4 py-3 text-sm text-secondary flex justify-between">
            <span>NGOs ({ngos.length})</span>
            {loading && <span className="text-muted">Loading...</span>}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-input text-secondary">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Location</th>
                  <th className="text-left px-4 py-3">Rating</th>
                  <th className="text-left px-4 py-3">Description</th>
                  <th className="text-left px-4 py-3">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {ngos.map((ngo) => (
                  <tr key={ngo.id} className="hover:bg-input/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-theme">{ngo.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-input text-secondary text-xs">{ngo.location}</span>
                    </td>
                    <td className="px-4 py-3">
                      {ngo.rating && ngo.rating.count > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400">★</span>
                          <span className="text-theme font-medium">{ngo.rating.average.toFixed(1)}</span>
                          <span className="text-muted text-xs">({ngo.rating.count})</span>
                        </div>
                      ) : (
                        <span className="text-muted text-xs">No ratings</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-secondary max-w-md">{ngo.description || "—"}</td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {ngo.accountOwner ? `${ngo.accountOwner.name}` : "—"}
                    </td>
                  </tr>
                ))}
                {!ngos.length && !loading && (
                  <tr>
                    <td className="px-4 py-8 text-muted text-center" colSpan={5}>
                      No NGOs registered yet. Be the first!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {error && <p className="px-4 py-3 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </main>
  );
}
