import Link from "next/link";
import { TaskCard } from "@/components/TaskCard";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getDashboard } from "@/lib/queries";
import type { OfferDTO } from "@/lib/types";

export const metadata = { title: "Dashboard" };

function OfferList({ offers }: { offers: OfferDTO[] }) {
  if (offers.length === 0) {
    return <p className="text-sm text-slate-500">Nothing here yet.</p>;
  }
  return (
    <ul className="divide-y divide-slate-100">
      {offers.slice(0, 10).map((offer) => (
        <li key={offer.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <Link href={`/tasks/${offer.taskId}`} className="text-sm font-semibold text-slate-800 hover:text-[#177245]">
              {offer.taskTitle}
            </Link>
            <p className="text-xs text-slate-500">
              {offer.taskerName} · {offer.estimatedHours}h · {offer.status}
            </p>
          </div>
          <span className="text-sm font-bold text-slate-900">${offer.price}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function DashboardPage() {
  await connectDB();
  const user = await getSessionUser();
  const dashboard = user ? await getDashboard(user.id) : null;

  if (!dashboard) {
    return <p className="text-sm text-slate-500">Sign in to see your dashboard.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Hello, {user?.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your tasks, offers and earnings in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Tasks posted</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{dashboard.client.taskCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Open tasks</p>
          <p className="mt-1 text-2xl font-bold text-[#177245]">{dashboard.client.openCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Offers made</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{dashboard.tasker.offers.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Earnings</p>
          <p className="mt-1 text-2xl font-bold text-[#177245]">${dashboard.tasker.earnings}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">My tasks</h2>
            <Link href="/tasks/new" className="text-sm font-semibold text-[#177245] hover:underline">
              Post a task →
            </Link>
          </div>
          {dashboard.client.tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              You have not posted any tasks yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {dashboard.client.tasks.slice(0, 6).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Offers on my tasks</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <OfferList offers={dashboard.client.offers} />
          </div>
          <h2 className="pt-2 text-lg font-semibold text-slate-900">My offers</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <OfferList offers={dashboard.tasker.offers} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">Tasker profile</p>
            <p className="mt-1 text-sm text-slate-500">
              {dashboard.tasker.profile
                ? `${dashboard.tasker.completedCount} jobs completed · ${dashboard.tasker.profile.ratingCount} reviews`
                : "Create a tasker profile to start receiving offers."}
            </p>
            <Link href="/taskers/me" className="mt-3 inline-block text-sm font-semibold text-[#177245] hover:underline">
              {dashboard.tasker.profile ? "Edit profile →" : "Create profile →"}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
