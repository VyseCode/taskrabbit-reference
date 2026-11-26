import Link from "next/link";
import { TaskCard } from "@/components/TaskCard";
import { TaskerCard } from "@/components/TaskerCard";
import { CATEGORIES } from "@/lib/categories";
import { connectDB } from "@/lib/db";
import { getTasks, searchTaskers } from "@/lib/queries";

export const metadata = { title: "Marketplace" };

export default async function MarketplacePage(props: PageProps<"/marketplace">) {
  const params = await props.searchParams;
  const page = Math.min(Math.max(Number(params.page) || 1, 1), 1000);
  await connectDB();

  const [openTasks, taskers] = await Promise.all([
    getTasks({ status: "open", page, limit: 6, sort: "newest" }),
    searchTaskers({ availability: "available", sort: "rating", page: 1, limit: 3 }),
  ]);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-[#143d2b] px-6 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#a7d5b8]">
          Local services marketplace
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          The help you need, from people nearby.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[#c8e0d2] sm:text-base">
          Post a task in minutes, compare offers from vetted local taskers, and get it done.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/tasks/new" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#143d2b] hover:bg-[#e8f4ed]">
            Post a task
          </Link>
          <Link href="/taskers" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
            Find a tasker
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Open tasks</h2>
            <p className="mt-1 text-sm text-slate-500">{openTasks.total} tasks looking for a tasker</p>
          </div>
          <Link href="/tasks?status=open" className="text-sm font-semibold text-[#177245] hover:underline">
            See all →
          </Link>
        </div>
        {openTasks.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No open tasks right now. Be the first to{" "}
            <Link href="/tasks/new" className="font-semibold text-[#177245] hover:underline">post one</Link>.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {openTasks.items.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>
        )}
        {openTasks.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-4 text-sm">
            {openTasks.page > 1 ? (
              <Link href={`/marketplace?page=${openTasks.page - 1}`} className="rounded-lg border border-slate-200 bg-white px-4 py-2">Previous</Link>
            ) : null}
            <span className="text-slate-500">Page {openTasks.page} of {openTasks.totalPages}</span>
            {openTasks.hasMore ? (
              <Link href={`/marketplace?page=${openTasks.page + 1}`} className="rounded-lg border border-slate-200 bg-white px-4 py-2">Next</Link>
            ) : null}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Top-rated taskers</h2>
            <p className="mt-1 text-sm text-slate-500">Trusted by people in your area</p>
          </div>
          <Link href="/taskers" className="text-sm font-semibold text-[#177245] hover:underline">
            Browse all →
          </Link>
        </div>
        {taskers.items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No available taskers yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {taskers.items.map((tasker) => <TaskerCard key={tasker.id} tasker={tasker} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-slate-900">Browse by category</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/tasks?category=${category.slug}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-[#177245] hover:text-[#177245]"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
