"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const steps = [
  "Pick your role: NGO (can book a location) or User (view only).",
  "NGO submits name + location. If another NGO already claimed it, the API returns 409.",
  "Users browse the public list of NGOs and locations; admins can audit via /api/admin.",
];

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  const isNgo = user?.role === "ngo";
  const isRegularUser = user?.role === "user";

  // Different actions based on auth state
  const getActions = () => {
    if (loading) return [];
    
    if (!isAuthenticated) {
      // Not logged in
      return [
        {
          title: "Register as NGO",
          href: "/ngo/register",
          description: "Create an NGO account and claim your first location.",
        },
        {
          title: "Browse NGOs",
          href: "/ngo/list",
          description: "View all registered NGOs and their locations.",
        },
        {
          title: "Login",
          href: "/login",
          description: "Already have an account? Sign in here.",
        },
      ];
    }
    
    if (isNgo) {
      // Logged in as NGO
      return [
        {
          title: "Add New Location",
          href: "/ngo/claim",
          description: "Claim another location for your NGO.",
        },
        {
          title: "Manage Locations",
          href: "/ngo/my",
          description: "View and edit your registered locations.",
        },
        {
          title: "Browse All NGOs",
          href: "/ngo/list",
          description: "See all registered NGOs in the directory.",
        },
      ];
    }
    
    // Logged in as regular user
    return [
      {
        title: "Browse NGOs",
        href: "/ngo/list",
        description: "View all registered NGOs and their locations.",
      },
      {
        title: "Dashboard",
        href: "/dashboard",
        description: "View your account information.",
      },
    ];
  };

  const actions = getActions();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ledger · NGO slotting</p>
          <h1 className="text-4xl font-semibold">Prevent duplicate NGO registrations</h1>
          <p className="text-slate-600 max-w-3xl">
            Two roles: NGO (can reserve locations) and User (view-only). When an NGO claims a location, nobody else can book that slot. Every step is backed by the API and Prisma schema.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-700">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">Unique location lock</span>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">RBAC: user vs NGO</span>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800">Public NGO list</span>
          </div>
          {isAuthenticated && user ? (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg w-fit ${
              isNgo 
                ? "text-emerald-700 bg-emerald-50 border border-emerald-100" 
                : "text-blue-700 bg-blue-50 border border-blue-100"
            }`}>
              <span>Signed in as {user.name}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                isNgo ? "bg-emerald-200" : "bg-blue-200"
              }`}>
                {user.role.toUpperCase()}
              </span>
              {isNgo && user.ngos && user.ngos.length > 0 && (
                <span className="font-medium">· {user.ngos.length} location(s)</span>
              )}
            </div>
          ) : null}
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {actions.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group border border-slate-200 rounded-xl bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-transform"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <p className="text-sm text-slate-600 mt-2">{item.description}</p>
            </Link>
          ))}
        </section>

        {!isAuthenticated && (
          <section className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Workflow</h3>
            <ol className="mt-3 space-y-2 text-sm text-slate-700">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3 items-start">
                  <span className="mt-0.5 h-6 w-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {isNgo && (
          <section className="border border-emerald-200 bg-emerald-50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-emerald-800">NGO Account Features</h3>
            <ul className="mt-3 space-y-2 text-sm text-emerald-700">
              <li>✓ Claim multiple locations for your NGO</li>
              <li>✓ Each location is exclusively reserved for you</li>
              <li>✓ Update contact info and description anytime</li>
              <li>✓ Appear in the public NGO directory</li>
            </ul>
          </section>
        )}

        {isRegularUser && (
          <section className="border border-blue-200 bg-blue-50 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-800">User Account</h3>
            <p className="mt-2 text-sm text-blue-700">
              You have a view-only account. You can browse all registered NGOs but cannot claim locations.
              Want to register an NGO? <Link href="/ngo/register" className="underline">Create an NGO account</Link>.
            </p>
          </section>
        )}

        <section className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm space-y-3 text-sm text-slate-700">
          <h3 className="text-lg font-semibold">API guardrails</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Prisma schema enforces a unique location per NGO.</li>
            <li>Middleware allows public GET /api/ngos but requires JWT for POST and admin routes.</li>
            <li>Conflicts return 409 so the frontend can surface the BookMyShow-style lockout.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
