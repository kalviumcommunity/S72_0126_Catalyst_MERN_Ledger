"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { NgoInfo } from "@/context/AuthContext";

export default function MyNgoPage() {
  const { user, isAuthenticated, loading: authLoading, authHeader } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (authLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-gray-500">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Login Required</h1>
        <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
      </div>
    );
  }

  if (user.role !== "ngo") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">NGO Account Required</h1>
        <p className="text-gray-600 mb-4">This page is only for NGO accounts.</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">Go to Dashboard</Link>
      </div>
    );
  }

  const ngos = user.ngos || [];

  if (ngos.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">No Locations</h1>
        <p className="text-gray-600 mb-4">You haven&apos;t registered any locations yet.</p>
        <Link
          href="/ngo/claim"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Claim Your First Location
        </Link>
      </div>
    );
  }

  function handleEdit(ngo: NgoInfo) {
    setDescription(ngo.description || "");
    setContactNumber(ngo.contactNumber || "");
    setEditingId(ngo.id);
    setMessage(null);
  }

  async function handleSave(ngoId: number) {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/ngos/${ngoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
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
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My NGO Locations</h1>
          <p className="text-gray-600 text-sm">{ngos.length} location(s) registered</p>
        </div>
        <Link
          href="/ngo/claim"
          className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
        >
          + Add Location
        </Link>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {ngos.map((ngo) => (
          <div key={ngo.id} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">{ngo.name}</h2>
                <p className="text-gray-600 text-sm">{ngo.location}</p>
              </div>
              {editingId !== ngo.id && (
                <button
                  onClick={() => handleEdit(ngo)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {editingId === ngo.id ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Contact</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(ngo.id)}
                    disabled={saving}
                    className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-600">
                <p><strong>Contact:</strong> {ngo.contactNumber || "Not set"}</p>
                <p><strong>Description:</strong> {ngo.description || "Not set"}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm">
        <Link href="/dashboard" className="text-blue-600 hover:underline">← Dashboard</Link>
        {" · "}
        <Link href="/ngo/list" className="text-blue-600 hover:underline">Browse NGOs</Link>
      </p>
    </div>
  );
}
