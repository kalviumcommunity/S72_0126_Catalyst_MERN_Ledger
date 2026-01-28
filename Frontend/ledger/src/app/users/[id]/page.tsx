import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function UserProfile({ params }: Props) {
  const { id } = params;
  const user = {
    id,
    name: "User " + id,
    email: `user${id}@example.com`,
    role: id === "1" ? "Admin" : "User",
    joinDate: "January 2026",
    status: "Active"
  };

  return (
    <main className="min-h-screen bg-theme">
      <div className="max-w-3xl mx-auto px-6 py-12 animate-fadeIn">
        <nav className="mb-6 text-sm text-muted">
          <Link href="/" className="hover:text-theme">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/users" className="hover:text-theme">Users</Link>
          <span className="mx-2">/</span>
          <span className="text-theme">User {id}</span>
        </nav>

        <div className="bg-card border border-theme rounded-xl overflow-hidden">
          <div className="bg-input px-8 py-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold">
                U{id}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-theme">{user.name}</h1>
                <p className="text-secondary">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-lg font-semibold text-theme mb-6">Profile Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted mb-1">User ID</p>
                  <p className="text-theme">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Full Name</p>
                  <p className="text-theme">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Email</p>
                  <p className="text-theme">{user.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted mb-1">Role</p>
                  <span className={`inline-flex px-2 py-0.5 text-xs rounded ${
                    user.role === "Admin" ? "bg-accent text-accent-foreground" : "bg-input text-secondary"
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Join Date</p>
                  <p className="text-theme">{user.joinDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Status</p>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded bg-emerald-500/20 text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-theme px-8 py-4">
            <Link href="/users" className="text-secondary hover:text-theme text-sm">
              ← Back to Users
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
