import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { PinIcon, StarIcon } from "@/components/Icons";
import { connectDB } from "@/lib/db";
import { getReviewsForTasker, getTaskerProfileByUserId } from "@/lib/queries";

type Props = PageProps<"/taskers/[id]">;

export default async function TaskerDetailPage(props: Props) {
  const { id } = await props.params;
  await connectDB();
  const tasker = await getTaskerProfileByUserId(id);
  if (!tasker) notFound();
  const reviews = await getReviewsForTasker(id);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <Link href="/taskers" className="text-sm font-medium text-[#177245] hover:underline">← All taskers</Link>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar name={tasker.name} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{tasker.name}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <PinIcon className="h-4 w-4" /> {tasker.location || "Remote"}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm">
                <StarIcon className="h-4 w-4 text-amber-500" />
                <strong className="text-slate-900">
                  {tasker.ratingCount ? tasker.ratingAvg.toFixed(1) : "No ratings yet"}
                </strong>
                <span className="text-slate-500">({tasker.ratingCount} reviews)</span>
              </p>
            </div>
            <div className="rounded-xl bg-[#f0f6f2] px-4 py-3 text-center">
              <p className="text-xl font-bold text-[#177245]">${tasker.hourlyRate}</p>
              <p className="text-xs text-slate-500">per hour</p>
            </div>
          </div>
          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {tasker.bio || "This tasker has not added a bio yet."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {tasker.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-[#f0f6f2] px-3 py-1 text-xs font-semibold text-[#177245]">{skill}</span>
            ))}
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No reviews yet. Complete a task with this tasker to leave one.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {reviews.map((review) => (
                <li key={review.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">{review.authorName}</p>
                    <span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                      <StarIcon className="h-4 w-4" /> {review.rating}/5
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Hire {tasker.name.split(" ")[0]}</h2>
          <p className="mt-2 text-sm text-slate-500">
            Post a task, then invite this tasker with an offer. You choose who to accept.
          </p>
          <Link href="/tasks/new" className="mt-4 block rounded-full bg-[#177245] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f5a36]">
            Post a task
          </Link>
          <Link href="/tasks?status=open" className="mt-2 block rounded-full border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:border-[#177245]">
            See open tasks
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
          <p className="font-semibold text-slate-800">At a glance</p>
          <dl className="mt-3 space-y-2 text-slate-600">
            <div className="flex justify-between"><dt>Jobs completed</dt><dd className="font-semibold">{tasker.completedTasks}</dd></div>
            <div className="flex justify-between"><dt>Avg. rating</dt><dd className="font-semibold">{tasker.ratingCount ? tasker.ratingAvg.toFixed(1) : "—"}</dd></div>
            <div className="flex justify-between"><dt>Availability</dt><dd className="font-semibold capitalize">{tasker.availability}</dd></div>
          </dl>
        </div>
      </aside>
    </div>
  );
}

export const metadata = { title: "Tasker profile" };
