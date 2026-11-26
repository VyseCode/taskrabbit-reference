import Link from "next/link";
import { TaskCard } from "@/components/TaskCard";
import { CATEGORIES } from "@/lib/categories";
import { connectDB } from "@/lib/db";
import { getTasks } from "@/lib/queries";

export const metadata = { title: "Tasks" };

export default async function TasksPage(props: PageProps<"/tasks">) {
  const params = await props.searchParams;
  const page = Math.min(Math.max(Number(params.page) || 1, 1), 1000);
  const status = typeof params.status === "string" ? params.status : "";
  const category = typeof params.category === "string" ? params.category : "";
  const q = typeof params.q === "string" ? params.q : "";

  await connectDB();
  const result = await getTasks({ page, limit: 12, status: status || undefined, category: category || undefined, q: q || undefined });

  const queryFor = (next: Record<string, string | number>) => {
    const merged = { page: 1, status, category, q, ...next };
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) search.set(key, String(value));
    }
    const string = search.toString();
    return string ? `/tasks?${string}` : "/tasks";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Browse tasks</h1>
          <p className="mt-1 text-sm text-slate-500">
            {result.total} {result.total === 1 ? "task" : "tasks"} available to help with
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="rounded-full bg-[#177245] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f5a36]"
        >
          Post a task
        </Link>
      </div>

      <form action="/tasks" method="get" className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px_180px_auto]">
        <input
          aria-label="Search tasks"
          name="q"
          defaultValue={q}
          placeholder="Search tasks by title"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20"
        />
        <select aria-label="Category" name="category" defaultValue={category} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item.slug} value={item.slug}>{item.name}</option>
          ))}
        </select>
        <select aria-label="Status" name="status" defaultValue={status} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">Any status</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          Apply
        </button>
      </form>

      {result.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-medium text-slate-700">No tasks match these filters</p>
          <p className="mt-1 text-sm text-slate-500">Try clearing a filter or posting a new task.</p>
          <Link href="/tasks" className="mt-4 inline-block text-sm font-semibold text-[#177245] hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4 text-sm" aria-label="Pagination">
          {result.page > 1 ? (
            <Link href={queryFor({ page: result.page - 1 })} className="rounded-lg border border-slate-200 bg-white px-4 py-2 hover:border-[#177245]">
              Previous
            </Link>
          ) : (
            <span className="px-4 py-2 text-slate-400">Previous</span>
          )}
          <span className="text-slate-500">Page {result.page} of {result.totalPages}</span>
          {result.hasMore ? (
            <Link href={queryFor({ page: result.page + 1 })} className="rounded-lg border border-slate-200 bg-white px-4 py-2 hover:border-[#177245]">
              Next
            </Link>
          ) : (
            <span className="px-4 py-2 text-slate-400">Next</span>
          )}
        </nav>
      )}
    </div>
  );
}
