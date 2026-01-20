import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Next.js App Router 🚀
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          This is a demonstration of page routing and dynamic routes using the Next.js 13+ App Router.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/users"
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            View Users
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Public Routes</h2>
          <p className="text-gray-600 mb-4">
            Access pages without authentication.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center text-gray-700">
              <span className="mr-2">✓</span> Home Page
            </li>
            <li className="flex items-center text-gray-700">
              <span className="mr-2">✓</span> Login Page
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Protected Routes</h2>
          <p className="text-gray-600 mb-4">
            Requires authentication to access.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center text-gray-700">
              <span className="mr-2">🔒</span> Dashboard
            </li>
            <li className="flex items-center text-gray-700">
              <span className="mr-2">🔒</span> User Profiles
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
