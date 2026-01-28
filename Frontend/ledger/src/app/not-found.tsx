import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-theme flex items-center justify-center">
      <div className="text-center animate-fadeIn">
        <div className="text-8xl font-bold text-theme mb-4">404</div>
        <h1 className="text-2xl font-bold text-theme mb-2">Page Not Found</h1>
        <p className="text-secondary mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/ngo/list"
            className="px-6 py-3 bg-card border border-theme text-theme rounded-lg font-medium hover:opacity-80 transition-colors"
          >
            Browse NGOs
          </Link>
        </div>
      </div>
    </main>
  );
}
