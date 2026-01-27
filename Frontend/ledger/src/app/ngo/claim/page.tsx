"use client";
import { useState, FormEvent } from "react";
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

  if (authLoading) {
    return <div className="max-w-md mx-auto px-4 py-16 text-gray-500">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Login Required</h1>
        <p className="text-gray-600 mb-4">Please login to claim a location.</p>
        <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
      </div>
    );
  }

  if (user.role !== "ngo") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">NGO Account Required</h1>
        <p className="text-gray-600 mb-4">Only NGO accounts can claim locations.</p>
        <Link href="/ngo/register" className="text-blue-600 hover:underline">Register as NGO</Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ngo/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
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
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">
        {existingCount > 0 ? "Add New Location" : "Claim Location"}
      </h1>
      <p className="text-gray-600 text-sm mb-6">
        {existingCount > 0 ? `You have ${existingCount} location(s). Add another.` : "Register your first NGO location."}
      </p>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-700">
          Location claimed! Redirecting...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">NGO Name</label>
            <input
              type="text"
              value={ngoName}
              onChange={(e) => setNgoName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <LocationInput value={location} onChange={setLocation} required />
          <div>
            <label className="block text-sm font-medium mb-1">Contact Number (optional)</label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Claiming..." : "Claim Location"}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm">
        <Link href="/ngo/my" className="text-blue-600 hover:underline">← Back to My NGOs</Link>
      </p>
    </div>
  );
}
