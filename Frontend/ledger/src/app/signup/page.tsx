"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "ngo">("user");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // NGO specific fields
  const [ngoName, setNgoName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: Record<string, string> = { name, email, password, role };
      if (role === "ngo") {
        payload.ngoName = ngoName;
        payload.contactNumber = contactNumber;
        payload.description = description;
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || data?.error || "Signup failed");
        return;
      }

      await login(email, password);
      // Redirect NGOs to claim page to set up their first location
      router.push(role === "ngo" ? "/ngo/claim" : redirectUrl);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-theme flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-card border border-theme rounded-2xl p-8">
          <div className="text-center mb-8 animate-slideDown">
            <h1 className="text-3xl font-bold text-theme mb-2">Create Account</h1>
            <p className="text-secondary text-sm">Join us and start your journey</p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-1 bg-input rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                role === "user" ? "bg-accent text-accent-foreground" : "text-secondary hover:text-theme"
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setRole("ngo")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                role === "ngo" ? "bg-accent text-accent-foreground" : "text-secondary hover:text-theme"
              }`}
            >
              NGO
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-secondary mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-secondary mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* NGO Fields */}
            <div className={`space-y-4 overflow-hidden transition-all duration-300 ${role === "ngo" ? "max-h-[320px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="pt-4 border-t border-theme">
                <p className="text-sm text-muted mb-4">NGO Details</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-secondary mb-1.5">Organization Name</label>
                    <input
                      type="text"
                      required={role === "ngo"}
                      value={ngoName}
                      onChange={(e) => setNgoName(e.target.value)}
                      placeholder="Your NGO"
                      className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary mb-1.5">Contact Number</label>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary mb-1.5">Description (Optional)</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="About your organization..."
                      className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-theme hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
