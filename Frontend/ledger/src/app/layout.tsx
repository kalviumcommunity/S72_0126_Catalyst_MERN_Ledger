import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          {/* Role-aware Navbar */}
          <Navbar />

          {/* Main Content - pt-16 to offset fixed navbar */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-gray-600 text-sm">
                © 2026 Ledger - NGO Directory
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
