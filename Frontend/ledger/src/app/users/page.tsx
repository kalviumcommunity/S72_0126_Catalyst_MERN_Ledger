import Link from "next/link";

export default function UsersPage() {
  const users = [
    { id: 1, name: "User 1", email: "user1@example.com", role: "Admin" },
    { id: 2, name: "User 2", email: "user2@example.com", role: "User" },
    { id: 3, name: "User 3", email: "user3@example.com", role: "User" },
  ];

  return (
    <main className="min-h-screen bg-theme">
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme mb-2">Users</h1>
          <p className="text-secondary">Click on a user to view their profile</p>
        </div>

        <div className="bg-card border border-theme rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-input text-secondary">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-input/50 transition-colors">
                  <td className="px-4 py-3 text-secondary">{user.id}</td>
                  <td className="px-4 py-3 font-medium text-theme">{user.name}</td>
                  <td className="px-4 py-3 text-secondary">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      user.role === "Admin" ? "bg-accent text-accent-foreground" : "bg-input text-secondary"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/users/${user.id}`} className="text-secondary hover:text-theme transition-colors">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
