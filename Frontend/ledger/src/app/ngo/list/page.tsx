"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface Ngo {
  id: number;
  name: string;
  location: string;
  description?: string | null;
  accountOwner?: {
    name: string;
    email: string;
  };
}

export default function NgoListPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNgo = user?.role === "ngo";
  const isRegularUser = isAuthenticated && user?.role === "user";

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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Public list</p>
          <h1 className="text-3xl font-semibold">Registered NGOs</h1>
          <p className="text-slate-600 text-sm">
            Everyone can view this list. Each location can only be held by one NGO. New entries appear here immediately after registration.
          </p>
        </div>

        {/* Show different options based on user role */}
        <div className="flex gap-3 text-sm">
          {!authLoading && (
            <>
              {/* Not logged in - show register and login */}
              {!isAuthenticated && (
                <>
                  <Link className="text-indigo-600" href="/ngo/register">Register as NGO</Link>
                  <span className="text-slate-400">·</span>
                  <Link className="text-indigo-600" href="/login">Login</Link>
                </>
              )}
              
              {/* Logged in as NGO - show add location */}
              {isNgo && (
                <>
                  <Link className="text-indigo-600" href="/ngo/claim">+ Add New Location</Link>
                  <span className="text-slate-400">·</span>
                  <Link className="text-indigo-600" href="/ngo/my">Manage My Locations</Link>
                </>
              )}
              
              {/* Logged in as regular user - just viewing, no action buttons */}
              {isRegularUser && (
                <span className="text-slate-500">Viewing as: {user?.name} (User)</span>
              )}
            </>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 flex justify-between">
            <span>NGOs ({ngos.length})</span>
            {loading ? <span className="text-slate-500">Loading...</span> : null}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Location</th>
                  <th className="text-left px-4 py-2">Description</th>
                  <th className="text-left px-4 py-2">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ngos.map((ngo) => (
                  <tr key={ngo.id} className="align-top">
                    <td className="px-4 py-3 font-medium">{ngo.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">{ngo.location}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-lg">{ngo.description || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {ngo.accountOwner ? `${ngo.accountOwner.name} (${ngo.accountOwner.email})` : "—"}
                    </td>
                  </tr>
                ))}
                {!ngos.length && !loading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500 text-sm" colSpan={4}>
                      No NGOs registered yet. Be the first to book a location.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {error ? <p className="px-4 py-3 text-sm text-rose-600">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
