import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  Next.js App Router
                </Link>
              </div>
              <nav className="flex gap-6">
                <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Home
                </Link>
                <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Login
                </Link>
                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/users" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Users
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-600 text-sm">
              © 2026 Next.js App Router Demo - Learning Project
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
