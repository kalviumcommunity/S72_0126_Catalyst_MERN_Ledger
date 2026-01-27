"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterNgoPage() {
  const { login, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ngoName, setNgoName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
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
        body: JSON.stringify({
          name,
          email,
          password,
          role: "ngo",
          ngoName,
          location,
          description,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error || "Failed to register NGO");
        return;
      }

      setSuccess("NGO registered. If the location was free, the account is created and you are being signed in.");
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">NGO booking</p>
          <h1 className="text-3xl font-semibold">Claim a location</h1>
          <p className="text-slate-600 text-sm">
            One NGO per location. If this form returns a 409, someone else already claimed the spot.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="grid gap-2 md:grid-cols-2 md:gap-4">
            <Field
              label="Your name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Field
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Field
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="grid gap-2 md:grid-cols-2 md:gap-4">
            <Field
              label="NGO name"
              id="ngoName"
              value={ngoName}
              onChange={(e) => setNgoName(e.target.value)}
              required
            />
            <Field
              label="Location (city/site)"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              helper="If this location is taken, you will get a 409 and must pick another."
            />
          </div>

          <Field
            label="Description (optional)"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            as="textarea"
          />

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Register NGO"}
          </button>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
        </form>

        <div className="text-sm text-slate-600 space-y-1">
          <p>
            Already have an account? <Link className="text-indigo-600" href="/login">Login</Link>.
          </p>
          <p>
            Want to see occupied locations? <Link className="text-indigo-600" href="/ngo/list">Browse NGOs</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  as?: "input" | "textarea";
  required?: boolean;
  helper?: string;
}

function Field({ id, label, value, onChange, type = "text", as = "input", required, helper }: FieldProps) {
  const sharedClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          className={`${sharedClass} min-h-[120px]`}
          required={required}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className={sharedClass}
        />
      )}
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}
