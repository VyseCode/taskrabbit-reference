import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { PinIcon, StarIcon } from "@/components/Icons";
import type { TaskerDTO } from "@/lib/types";

export function TaskerCard({ tasker }: { tasker: TaskerDTO }) {
  return (
    <Link
      href={`/taskers/${tasker.userId}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#177245]/40 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <Avatar name={tasker.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900 group-hover:text-[#177245]">
            {tasker.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <PinIcon className="h-3.5 w-3.5" /> {tasker.location || "Remote"}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
            <StarIcon className="h-3.5 w-3.5 text-amber-500" />
            <strong>{tasker.ratingCount ? tasker.ratingAvg.toFixed(1) : "New"}</strong>
            <span className="text-slate-400">
              ({tasker.ratingCount} {tasker.ratingCount === 1 ? "review" : "reviews"})
            </span>
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-500">{tasker.bio}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tasker.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-full bg-[#f0f6f2] px-2.5 py-1 text-xs font-medium text-[#177245]">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-semibold text-slate-900">
          ${tasker.hourlyRate}<span className="text-xs font-normal text-slate-500">/hr</span>
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
            tasker.availability === "available"
              ? "bg-[#e8f4ed] text-[#177245]"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {tasker.availability}
        </span>
      </div>
    </Link>
  );
}
