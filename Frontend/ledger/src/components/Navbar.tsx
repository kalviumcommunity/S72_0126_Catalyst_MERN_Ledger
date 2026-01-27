"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  const isNgo = user?.role === "ngo";

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg text-gray-900">
          Ledger
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/ngo/list" className="text-sm text-gray-600 hover:text-gray-900">
            NGOs
          </Link>

          {loading ? (
            <span className="text-sm text-gray-400">...</span>
          ) : isAuthenticated && user ? (
            <>
              {isNgo && (
                <Link href="/ngo/claim" className="text-sm text-emerald-600 hover:text-emerald-700">
                  + Add Location
                </Link>
              )}
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-sm text-gray-500">
                {user.name}
                <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                  isNgo ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {user.role.toUpperCase()}
                </span>
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
