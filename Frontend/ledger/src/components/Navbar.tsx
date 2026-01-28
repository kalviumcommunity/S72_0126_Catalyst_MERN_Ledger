"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isNgo = user?.role === "ngo";

  return (
    <nav className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-md border-b border-theme z-50 transition-colors">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-theme hover:opacity-70 transition-opacity">
          Ledger
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/ngo/list" className="text-sm text-secondary hover:text-theme transition-colors">
            NGOs
          </Link>

          {loading ? (
            <span className="text-sm text-muted">...</span>
          ) : isAuthenticated && user ? (
            <>
              {isNgo && (
                <Link href="/ngo/claim" className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors">
                  + Add
                </Link>
              )}
              <Link href="/dashboard" className="text-sm text-secondary hover:text-theme transition-colors">
                Dashboard
              </Link>
              <span className="text-sm text-muted">
                {user.name}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                  isNgo ? "bg-emerald-500/20 text-emerald-500" : "bg-card text-secondary"
                }`}>
                  {user.role.toUpperCase()}
                </span>
              </span>
              <button onClick={logout} className="text-sm text-red-500 hover:text-red-400 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-secondary hover:text-theme transition-colors">
                Login
              </Link>
              <Link href="/signup" className="text-sm bg-accent text-accent-foreground px-3 py-1.5 rounded-lg font-medium hover:opacity-80 transition-opacity">
                Sign Up
              </Link>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-card border border-theme hover:opacity-80 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4 text-theme" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-theme" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
