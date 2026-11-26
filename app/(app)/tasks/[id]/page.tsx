import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { ClockIcon, PinIcon } from "@/components/Icons";
import { StatusBadge } from "@/components/TaskCard";
import { categoryName } from "@/lib/categories";
import { connectDB } from "@/lib/db";
import {
  getReviewsForTask,
  getTaskById,
  getVisibleOffers,
} from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { OffersPanel } from "@/components/OffersPanel";
import { ReviewForm } from "@/components/ReviewForm";

type Props = PageProps<"/tasks/[id]">;

export default async function TaskDetailPage(props: Props) {
  const { id } = await props.params;
  await connectDB();
  const [task, user] = await Promise.all([getTaskById(id), getSessionUser()]);
  if (!task) notFound();

  const isOwner = user?.id === task.clientId;
  const [offers, reviews] = await Promise.all([
    getVisibleOffers(task.id, user?.id ?? "", isOwner),
    getReviewsForTask(task.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/tasks" className="text-sm font-medium text-[#177245] hover:underline">
        ← All tasks
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#f0f6f2] px-3 py-1 text-xs font-semibold text-[#177245]">
            {categoryName(task.category)}
          </span>
          <StatusBadge status={task.status} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {task.title}
        </h1>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {task.description}
        </p>

        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Budget</dt>
            <dd className="mt-1 text-lg font-bold text-slate-900">${task.budget}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">When</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm text-slate-700">
              <ClockIcon className="h-4 w-4 text-slate-400" />
              {new Date(task.date).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Where</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm text-slate-700">
              <PinIcon className="h-4 w-4 text-slate-400" />
              {task.location}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
          <Avatar name={task.clientName} size="md" />
          <div>
            <p className="text-sm font-semibold text-slate-800">{task.clientName}</p>
            <p className="text-xs text-slate-500">{isOwner ? "You posted this task" : "Task owner"}</p>
          </div>
        </div>
      </div>

      <OffersPanel
        task={task}
        offers={offers}
        isOwner={isOwner}
        currentUserId={user?.id ?? ""}
      />

      {task.status === "completed" && isOwner && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {reviews.length === 0 ? (
            <ReviewForm taskId={task.id} />
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Your review</h2>
              <p className="mt-2 text-sm text-slate-600">
                You rated this task {reviews[0].rating}/5. Thank you for the feedback.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export const metadata = { title: "Task details" };
