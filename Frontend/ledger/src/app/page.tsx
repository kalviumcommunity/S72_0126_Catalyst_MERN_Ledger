"use client";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";

type TaskStatus = "todo" | "in_progress" | "done";
type ProjectStatus = "planning" | "active" | "completed";

type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  assignee: string | null;
  tags: string[];
  templateUrl?: string;
};

type Project = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  status: ProjectStatus;
  isPublic: boolean;
  owner: string;
  startDate: string;
  endDate?: string;
  tasks: Task[];
};

const sampleProjects: Project[] = [
  {
    id: 1,
    title: "Water Access Mapping",
    description: "Catalog rural wells and water points to prevent duplicated field surveys.",
    tags: ["water", "mapping", "visibility"],
    status: "active",
    isPublic: true,
    owner: "Global Water Co-Op",
    startDate: "2025-10-12",
    tasks: [
      {
        id: 11,
        title: "Collect GPS coordinates",
        description: "Gather lat/long for all surveyed wells.",
        status: "in_progress",
        priority: "high",
        assignee: "Anika Rao",
        tags: ["data", "field"],
        templateUrl: "https://templates.ngo/water-gps",
      },
      {
        id: 12,
        title: "Normalize survey schema",
        description: "Convert partner CSVs into the shared schema.",
        status: "todo",
        priority: "medium",
        assignee: "Lee Carter",
        tags: ["schema", "data"],
      },
      {
        id: 13,
        title: "Publish public dashboard",
        description: "Deploy a read-only dashboard for public access.",
        status: "done",
        priority: "medium",
        assignee: "Priya S",
        tags: ["visibility", "dashboard"],
      },
    ],
  },
  {
    id: 2,
    title: "Logistics Playbook",
    description: "Reusable SOPs for crisis logistics to avoid reinventing task flows.",
    tags: ["logistics", "templates", "reusability"],
    status: "planning",
    isPublic: true,
    owner: "Relief Ops Hub",
    startDate: "2025-12-01",
    tasks: [
      {
        id: 21,
        title: "Template: cold-chain checklist",
        description: "Reusable checklist for vaccine cold-chain setup.",
        status: "in_progress",
        priority: "high",
        assignee: "N/A",
        tags: ["template", "health"],
        templateUrl: "https://templates.ngo/cold-chain",
      },
      {
        id: 22,
        title: "Partner intake form",
        description: "Standardize partner readiness questions.",
        status: "todo",
        priority: "low",
        assignee: null,
        tags: ["forms", "partners"],
      },
    ],
  },
  {
    id: 3,
    title: "Health Camp Ops",
    description: "Taggable tasks for rapid deployment of pop-up health camps.",
    tags: ["health", "ops", "tags"],
    status: "completed",
    isPublic: true,
    owner: "Wellness Now",
    startDate: "2025-06-05",
    endDate: "2025-09-18",
    tasks: [
      {
        id: 31,
        title: "Volunteer roster template",
        description: "Spreadsheet template for shift planning.",
        status: "done",
        priority: "medium",
        assignee: "Fatima Ali",
        tags: ["volunteers", "template"],
        templateUrl: "https://templates.ngo/volunteer-roster",
      },
      {
        id: 32,
        title: "Health supplies intake",
        description: "Bill of materials for camp setup.",
        status: "done",
        priority: "high",
        assignee: "Samir K",
        tags: ["supplies", "checklist"],
      },
    ],
  },
];

const statusColors: Record<TaskStatus | ProjectStatus, string> = {
  todo: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  done: "bg-emerald-100 text-emerald-800",
  planning: "bg-slate-100 text-slate-800",
  active: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
};

const priorityColors = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
};

export default function Home() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUI();

  const { totalTasks, templates, tagCloud } = useMemo(() => {
    const allTasks = sampleProjects.flatMap((p) => p.tasks);
    const templates = allTasks.filter((t) => Boolean(t.templateUrl)).length;
    const tagCount = new Map<string, number>();
    allTasks.forEach((t) => t.tags.forEach((tag) => tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1)));
    return {
      totalTasks: allTasks.length,
      templates,
      tagCloud: Array.from(tagCount.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, []);

  return (
    <main
      className={`min-h-screen transition-colors px-6 py-10 md:px-12 lg:px-16 ${
        theme === "dark" ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"
      }`}
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-slate-500">Ledger Platform</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Stop NGO work duplication</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-3xl">
            Visibility, reusability, and smart tagging to make contribution pipelines transparent and prevent teams from reinventing the same tasks.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">Public by default</span>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm">Reusable templates</span>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm">Tag-based discovery</span>
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
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Contribution pipeline</h3>
          <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex gap-3">
              <span className="mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs">1</span>
              Post projects as **public** to improve visibility (Project.isPublic default true).
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs">2</span>
              Break work into tasks with templateUrl for reuse; tag tasks for discovery.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs">3</span>
              Assign owners and contributors; RBAC middleware keeps admin routes protected.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs">4</span>
              Share templates and tags across projects to prevent duplicated effort.
            </li>
          </ol>
          <div className="mt-4 text-xs text-slate-500">
            Mirrors the Prisma schema: User owns Projects; Projects → Tasks; Tags via ProjectTag / TaskTag.
          </div>
        </div>
      </section>

      {sidebarOpen && (
        <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold mb-2">Sidebar (UI context)</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            This panel is toggled via UIContext. Use it to surface quick filters, saved searches, or role-based shortcuts.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Role</span>
              <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">admin</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Auth</span>
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">{isAuthenticated ? "authenticated" : "guest"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Theme</span>
              <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs">{theme}</span>
            </div>
          </div>
        </aside>
      )}
    </main>
  );
}

function StatCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="text-3xl font-semibold mt-1">{value}</div>
      <p className="text-xs text-slate-500 mt-1">{detail}</p>
    </div>
  );
}
