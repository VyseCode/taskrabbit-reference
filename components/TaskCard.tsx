import Link from "next/link";
import { ClockIcon, PinIcon } from "@/components/Icons";
import { categoryName } from "@/lib/categories";
import type { TaskDTO } from "@/lib/types";

const statusStyles: Record<string, string> = {
  open: "bg-[#e8f4ed] text-[#177245]",
  assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-50 text-red-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function TaskCard({ task }: { task: TaskDTO }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#177245]/40 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-full bg-[#f0f6f2] px-2.5 py-1 text-xs font-semibold text-[#177245]">
          {categoryName(task.category)}
        </span>
        <StatusBadge status={task.status} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#177245]">
        {task.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <PinIcon className="h-3.5 w-3.5" /> {task.location}
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon className="h-3.5 w-3.5" />
          {new Date(task.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-lg font-bold text-slate-900">${task.budget}</span>
        <span className="text-xs text-slate-500">
          {task.offersCount} {task.offersCount === 1 ? "offer" : "offers"}
        </span>
      </div>
    </Link>
  );
}
