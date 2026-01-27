"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <Link href="/login" className="text-blue-600 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  const isNgo = user.role === "ngo";
  const ngos = user.ngos || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <strong>{user.name}</strong>!
          </p>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      {/* User Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
              user.role === "admin" 
                ? "bg-purple-100 text-purple-800" 
                : user.role === "ngo"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}>
              {user.role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* NGO Section - Only for NGO users */}
      {isNgo && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your NGO Locations</h2>
            <Link
              href="/ngo/claim"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              + Add Location
            </Link>
          </div>
          
          {ngos.length === 0 ? (
            <p className="text-gray-600">You haven&apos;t registered any locations yet.</p>
          ) : (
            <div className="space-y-3">
              {ngos.map((ngo) => (
                <div key={ngo.id} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold">{ngo.name}</h3>
                  <p className="text-sm text-gray-600">{ngo.location}</p>
                  {ngo.description && (
                    <p className="text-sm text-gray-500 mt-1">{ngo.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {ngos.length > 0 && (
            <Link
              href="/ngo/my"
              className="inline-block mt-4 text-blue-600 hover:underline text-sm"
            >
              Manage your locations →
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <Link
            href="/ngo/list"
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Browse All NGOs</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {isNgo && (
            <Link
              href="/ngo/claim"
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Claim New Location</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Logout</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="mr-2">👤</span>
            <span><strong>Name:</strong> {user.name}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📧</span>
            <span><strong>Email:</strong> {user.email}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🔑</span>
            <span><strong>Role:</strong> {user.role}</span>
          </li>
          {isNgo && (
            <li className="flex items-start">
              <span className="mr-2">📍</span>
              <span><strong>Locations:</strong> {ngos.length} registered</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
