"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface NgoInfo {
  id: number;
  name: string;
  location: string;
  contactNumber?: string | null;
  description?: string | null;
  rating?: number;
  ratingCount?: number;
}

interface TaskInfo {
  id: number;
  otp: string;
  expiresAt: string;
  ngo: { id: number; name: string; location: string };
  _count: { ratings: number };
}

export default function MyNgoPage() {
  const { user, isAuthenticated, loading: authLoading, authHeader } = useAuth();
  const [ngos, setNgos] = useState<NgoInfo[]>([]);
  const [ngosLoading, setNgosLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Task/OTP state
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [generatingOtp, setGeneratingOtp] = useState<number | null>(null);
  const [endingLocation, setEndingLocation] = useState<number | null>(null);

  const fetchNgos = useCallback(async () => {
    if (!authHeader.Authorization) return;
    setNgosLoading(true);
    try {
      const res = await fetch("/api/ngo/my", {
        headers: authHeader as HeadersInit,
      });
      if (res.ok) {
        const data = await res.json();
        setNgos(data.ngos || []);
      }
    } catch (err) {
      console.error("Failed to fetch NGOs:", err);
    } finally {
      setNgosLoading(false);
    }
  }, [authHeader]);

  const fetchTasks = useCallback(async () => {
    if (!authHeader.Authorization) return;
    try {
      const res = await fetch("/api/tasks", {
        headers: authHeader as HeadersInit,
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  }, [authHeader]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "ngo") {
      fetchNgos();
      fetchTasks();
    }
  }, [isAuthenticated, user, fetchNgos, fetchTasks]);

  if (authLoading || ngosLoading) {
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
          <Link href="/login" className="text-secondary hover:text-theme">Login →</Link>
        </div>
      </main>
    );
  }

  if (user.role !== "ngo") {
    return (
      <main className="min-h-screen bg-theme flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme mb-4">NGO Account Required</h1>
          <Link href="/dashboard" className="text-secondary hover:text-theme">Go to Dashboard →</Link>
        </div>
      </main>
    );
  }

  if (ngos.length === 0) {
    return (
      <main className="min-h-screen bg-theme flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme mb-4">No Locations</h1>
          <p className="text-secondary mb-6">You haven&apos;t registered any locations yet.</p>
          <Link href="/ngo/claim" className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-colors">
            Claim Your First Location
          </Link>
        </div>
      </main>
    );
  }

  function handleEdit(ngo: NgoInfo) {
    setDescription(ngo.description || "");
    setContactNumber(ngo.contactNumber || "");
    setEditingId(ngo.id);
    setMessage(null);
  }

  async function handleGenerateOtp(ngoId: number) {
    setGeneratingOtp(ngoId);
    setMessage(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader } as HeadersInit,
        body: JSON.stringify({ ngoId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate OTP");
      setMessage({ type: "success", text: `OTP generated: ${data.task.otp}` });
      fetchTasks();
    } catch (err) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setGeneratingOtp(null);
    }
  }

  async function handleEndLocation(ngoId: number) {
    if (!confirm("Are you sure you want to end this location? This will release it for others to claim.")) return;
    setEndingLocation(ngoId);
    setMessage(null);
    try {
      const res = await fetch(`/api/ngos/${ngoId}/end`, {
        method: "DELETE",
        headers: { ...authHeader } as HeadersInit,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to end location");
      setMessage({ type: "success", text: "Location released successfully!" });
      // Refresh NGO list from server
      await fetchNgos();
      await fetchTasks();
    } catch (err) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setEndingLocation(null);
    }
  }

  function getActiveTask(ngoId: number): TaskInfo | undefined {
    return tasks.find(t => t.ngo.id === ngoId);
  }

  function formatExpiry(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  }

  async function handleSave(ngoId: number) {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/ngos/${ngoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader } as HeadersInit,
        body: JSON.stringify({ description, contactNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      setMessage({ type: "success", text: "Updated! Refresh to see changes." });
      setEditingId(null);
    } catch (err) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-theme">
      <div className="max-w-3xl mx-auto px-6 py-12 animate-fadeIn">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-theme mb-1">My Locations</h1>
            <p className="text-secondary text-sm">{ngos.length} location(s) registered</p>
          </div>
          <Link
            href="/ngo/claim"
            className="px-4 py-2 bg-accent text-accent-foreground text-sm rounded-lg font-medium hover:opacity-90 transition-colors"
          >
            + Add
          </Link>
        </div>

        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm ${
            message.type === "success" 
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {ngos.map((ngo) => {
            const activeTask = getActiveTask(ngo.id);
            
            return (
            <div key={ngo.id} className="bg-card border border-theme rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-lg text-theme">{ngo.name}</h2>
                  <p className="text-secondary text-sm">{ngo.location}</p>
                  {ngo.ratingCount !== undefined && ngo.ratingCount > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-amber-400">{"★".repeat(Math.round(ngo.rating || 0))}</span>
                      <span className="text-muted text-xs">{ngo.rating?.toFixed(1)} ({ngo.ratingCount} ratings)</span>
                    </div>
                  )}
                </div>
                {editingId !== ngo.id && (
                  <button onClick={() => handleEdit(ngo)} className="text-secondary hover:text-theme text-sm">
                    Edit
                  </button>
                )}
              </div>

              {/* Active Task / OTP Section */}
              <div className="mt-4 p-4 bg-input rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-secondary">Event OTP</span>
                  {activeTask && (
                    <span className="text-xs text-muted">{formatExpiry(activeTask.expiresAt)}</span>
                  )}
                </div>
                {activeTask ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <code className="text-2xl font-mono font-bold text-theme tracking-widest">{activeTask.otp}</code>
                      <p className="text-xs text-muted mt-1">{activeTask._count.ratings} participant(s) rated</p>
                    </div>
                    <button
                      onClick={() => handleGenerateOtp(ngo.id)}
                      disabled={generatingOtp === ngo.id}
                      className="px-3 py-1.5 text-xs bg-card border border-theme text-secondary rounded-lg hover:text-theme"
                    >
                      New OTP
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateOtp(ngo.id)}
                    disabled={generatingOtp === ngo.id}
                    className="w-full py-2 bg-accent text-accent-foreground text-sm rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {generatingOtp === ngo.id ? "Generating..." : "Generate OTP for Event"}
                  </button>
                )}
              </div>

              {editingId === ngo.id ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm text-secondary mb-1">Contact</label>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-sm text-theme focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-secondary mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-sm text-theme focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(ngo.id)}
                      disabled={saving}
                      className="px-4 py-2 bg-accent text-accent-foreground text-sm rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-input text-secondary text-sm rounded-lg hover:opacity-80"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-muted">
                  <p><span className="text-secondary">Contact:</span> {ngo.contactNumber || "Not set"}</p>
                  <p><span className="text-secondary">Description:</span> {ngo.description || "Not set"}</p>
                </div>
              )}

              {/* End Location Button */}
              <div className="mt-4 pt-4 border-t border-theme">
                <button
                  onClick={() => handleEndLocation(ngo.id)}
                  disabled={endingLocation === ngo.id}
                  className="text-red-400 text-sm hover:text-red-300 disabled:opacity-50"
                >
                  {endingLocation === ngo.id ? "Releasing..." : "End & Release Location"}
                </button>
              </div>
            </div>
          );
          })}
        </div>

        <div className="mt-8 text-sm text-muted">
          <Link href="/dashboard" className="hover:text-theme">← Dashboard</Link>
          <span className="mx-2">·</span>
          <Link href="/ngo/list" className="hover:text-theme">Browse NGOs</Link>
        </div>
      </div>
    </main>
  );
}
