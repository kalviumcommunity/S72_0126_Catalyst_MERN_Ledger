import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function UserProfile({ params }: Props) {
  const { id } = params;
  // Mock fetch user data
  const user = {
    id,
    name: "User " + id,
    email: `user${id}@example.com`,
    role: id === "1" ? "Admin" : "User",
    joinDate: "January 2026",
    status: "Active"
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/users" className="hover:text-gray-900">Users</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">User {id}</span>
      </nav>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-12">
          <div className="flex items-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold text-blue-600">
              U{id}
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
              <p className="text-blue-100">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  User ID
                </label>
                <p className="text-gray-900 font-semibold">{user.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900 font-semibold">{user.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900 font-semibold">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Role
                </label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  user.role === "Admin" 
                    ? "bg-purple-100 text-purple-800" 
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {user.role}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Join Date
                </label>
                <p className="text-gray-900 font-semibold">{user.joinDate}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Status
                </label>
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t">
          <Link
            href="/users"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            ← Back to Users List
          </Link>
        </div>
      </div>

      <div className="mt-6 bg-gray-100 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Dynamic Route Demo</h3>
        <p className="text-sm text-gray-600">
          This page is generated from <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">/users/[id]/page.tsx</code>.
          Try visiting /users/1, /users/2, or any number to see different profiles!
        </p>
      </div>
    </div>
  );
}
