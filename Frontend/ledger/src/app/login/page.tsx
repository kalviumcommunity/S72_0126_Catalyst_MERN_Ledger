"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    await login(email, password);
    setMessage("Login request sent. If credentials are valid you are now signed in.");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="max-w-xl mx-auto px-6 py-12 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Login</h1>
          <p className="text-slate-600 text-sm">
            NGO accounts can manage locations; regular users can log in to view session-only content (if any).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        </form>

        <div className="text-sm text-slate-600">
          <p>
            Need to register an NGO? <Link className="text-indigo-600" href="/ngo/register">Book a location</Link>.
          </p>
          <p>
            Want to browse without logging in? <Link className="text-indigo-600" href="/ngo/list">See the public list</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
