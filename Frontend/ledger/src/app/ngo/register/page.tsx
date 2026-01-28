"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterNgoPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "ngo" }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error || "Failed to register NGO");
        return;
      }

      setSuccess("Account created! Signing you in...");
      await login(email, password);
      router.push("/ngo/claim");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-theme flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2">NGO Registration</p>
          <h1 className="text-3xl font-bold text-theme mb-2">Create NGO Account</h1>
          <p className="text-secondary text-sm">Register as an NGO to claim locations.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-theme rounded-2xl p-8 space-y-4">
          <Field label="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}
          {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">{success}</div>}

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating Account..." : "Create NGO Account"}
          </button>
          
          <p className="text-xs text-center text-muted">
            After registration, you&apos;ll be redirected to claim your first location.
          </p>
        </form>

        <div className="mt-6 text-center text-sm text-muted space-y-1">
          <p>Already have an account? <Link href="/login" className="text-theme hover:underline">Login</Link></p>
          <p>Want to see NGOs? <Link href="/ngo/list" className="text-secondary hover:text-theme">Browse list</Link></p>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", required }: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-secondary mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  );
}
