import Link from "next/link";

export default function Home() {
  return (
<<<<<< feedback_UI
    <main
      className={`min-h-screen transition-colors px-6 py-10 md:px-12 lg:px-16 ${
        theme === "dark" ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"
      }`}
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-slate-500">{process.env.NEXT_PUBLIC_APP_NAME ?? 'Ledger'} Platform</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Stop NGO work duplication</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-3xl">
            Visibility, reusability, and smart tagging to make contribution pipelines transparent and prevent teams from reinventing the same tasks.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">Public by default</span>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm">Reusable templates</span>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm">Tag-based discovery</span>
            <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-sm">Env: {process.env.NEXT_PUBLIC_ENV ?? 'local'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <div className="flex gap-3">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition"
            >
              Toggle Theme ({theme})
            </button>
            <button
              onClick={toggleSidebar}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-indigo-400 transition"
            >
              {sidebarOpen ? "Hide" : "Show"} Sidebar
            </button>
          </div>
          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              <>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">Logged in as {user}</span>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => login("kalvium.admin@ledger")}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white shadow hover:bg-emerald-700 transition"
              >
                Quick Login
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3 mb-10">
        <StatCard label="Projects" value={sampleProjects.length} detail="Public by default" />
        <StatCard label="Tasks" value={totalTasks} detail="Mapped to projects" />
        <StatCard label="Reusable Templates" value={templates} detail="Shareable task flows" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3 mb-10">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Projects</h2>
            <span className="text-sm text-slate-500">Aligned with schema (visibility + tags + owner)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Project</th>
                  <th className="py-2">Tags</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Visibility</th>
                  <th className="py-2">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sampleProjects.map((project) => (
                  <tr key={project.id} className="align-top">
                    <td className="py-3 pr-4">
                      <div className="font-semibold">{project.title}</div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md">{project.description}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[project.status]}`}>{project.status}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">{project.isPublic ? "public" : "private"}</span>
                    </td>
                    <td className="py-3 text-sm text-slate-600 dark:text-slate-300">{project.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Tag Cloud (discovery)</h3>
          <div className="flex flex-wrap gap-2">
            {tagCloud.map(([tag, count]) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs">
                {tag} · {count}
              </span>
            ))}
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Tags align with TaskTag / ProjectTag for discovery. Heavier tags bubble to the top.
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 mb-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Task Board</h3>
            <span className="text-xs text-slate-500">Status + priority + assignee</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {["todo", "in_progress", "done"].map((status) => (
              <div key={status} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold capitalize">{status.replace("_", " ")}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status as TaskStatus]}`}>
                    {sampleProjects.flatMap((p) => p.tasks).filter((t) => t.status === status).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {sampleProjects
                    .flatMap((p) => p.tasks)
                    .filter((t) => t.status === status)
                    .map((task) => (
                      <div key={task.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{task.title}</p>
                          <span className={`px-2 py-1 rounded-full text-[10px] ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{task.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 text-[11px]">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{task.assignee ?? "Unassigned"}</span>
                          {task.templateUrl ? (
                            <a
                              className="text-indigo-500 hover:text-indigo-600"
                              href={task.templateUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View template
                            </a>
                          ) : (
                            <span className="text-slate-400">No template</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

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
> main
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
