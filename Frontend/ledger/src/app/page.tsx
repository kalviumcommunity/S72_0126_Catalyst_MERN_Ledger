"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const isNgo = user?.role === "ngo";

  const getActions = () => {
    if (loading) return [];
    if (!isAuthenticated) {
      return [
        { title: "Claim Location", href: "/signup?redirect=/ngo/claim", description: "Sign up as NGO and claim a location." },
        { title: "Browse NGOs", href: "/ngo/list", description: "View all registered NGOs." },
        { title: "Login", href: "/login", description: "Already have an account? Sign in." },
      ];
    }
    if (isNgo) {
      return [
        { title: "Add Location", href: "/ngo/claim", description: "Claim another location for your NGO." },
        { title: "My Locations", href: "/ngo/my", description: "Manage your registered locations." },
        { title: "Browse NGOs", href: "/ngo/list", description: "See all NGOs in the directory." },
      ];
    }
    return [
      { title: "Browse NGOs", href: "/ngo/list", description: "View all registered NGOs." },
      { title: "Dashboard", href: "/dashboard", description: "View your account." },
    ];
  };

  const actions = getActions();

  return (
    <main className="min-h-screen bg-theme">
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-10 animate-fadeIn">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Ledger</p>
          <h1 className="text-4xl font-bold text-theme">NGO Directory</h1>
          <p className="text-secondary max-w-2xl">
            Register your NGO and claim unique locations. Each location can only be held by one organization.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-card border border-theme text-secondary">Unique locations</span>
            <span className="px-3 py-1 rounded-full bg-card border border-theme text-secondary">Role-based access</span>
            <span className="px-3 py-1 rounded-full bg-card border border-theme text-secondary">Public listing</span>
          </div>
          {isAuthenticated && user ? (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg w-fit ${
              isNgo ? "bg-emerald-500/10 text-emerald-500" : "bg-card text-secondary"
            }`}>
              <span>Signed in as {user.name}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                isNgo ? "bg-emerald-500/20" : "bg-input"
              }`}>
                {user.role.toUpperCase()}
              </span>
              {isNgo && user.ngos && user.ngos.length > 0 && (
                <span>· {user.ngos.length} location(s)</span>
              )}
            </div>
          ) : null}
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {actions.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-card border border-theme rounded-xl p-5 hover:opacity-80 transition-all"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-theme">{item.title}</h2>
                <span className="text-muted group-hover:text-theme group-hover:translate-x-1 transition-all">→</span>
              </div>
              <p className="text-sm text-secondary mt-2">{item.description}</p>
            </Link>
          ))}
        </section>

      </section>
    </main>
  );
}
