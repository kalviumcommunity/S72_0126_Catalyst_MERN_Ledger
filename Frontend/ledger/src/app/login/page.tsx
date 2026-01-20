"use client";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting login for:", username);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        console.log("Login successful!");
        // Cookie is already set by the API response
        // Store token in cookie if it's not already set
        if (data.token) {
          Cookies.set("token", data.token, { expires: 1, path: "/" });
        }
        console.log("Redirecting to dashboard...");
        // Use router.push for client-side navigation
        router.push("/dashboard");
        // Force a full page reload to ensure middleware picks up the cookie
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        setError(data.message || "Invalid username or password");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Sign in to access protected routes</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="mt-6 bg-gray-100 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Demo Credentials:</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div className="bg-white p-3 rounded border border-gray-200">
            <strong>Admin Account:</strong>
            <br />Username: <code className="bg-gray-100 px-2 py-0.5 rounded">admin</code>
            <br />Password: <code className="bg-gray-100 px-2 py-0.5 rounded">admin123</code>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <strong>User Account:</strong>
            <br />Username: <code className="bg-gray-100 px-2 py-0.5 rounded">user1</code> or <code className="bg-gray-100 px-2 py-0.5 rounded">user2</code>
            <br />Password: <code className="bg-gray-100 px-2 py-0.5 rounded">user123</code>
          </div>
        </div>
      </div>
    </div>
  );
}

