import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center mt-16">
      <div className="bg-white rounded-lg shadow-md p-12">
        <div className="text-6xl font-bold text-red-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/users"
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            View Users
          </Link>
        </div>
      </div>
    </div>
  );
}
