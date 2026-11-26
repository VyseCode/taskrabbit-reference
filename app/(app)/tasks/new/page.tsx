import Link from "next/link";
import { TaskForm } from "@/components/TaskForm";

export const metadata = { title: "Post a task" };

export default function NewTaskPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/tasks" className="text-sm font-medium text-[#177245] hover:underline">
          ← Back to tasks
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Post a task</h1>
        <p className="mt-1 text-sm text-slate-500">
          Describe the job and a fair budget. Local taskers can then send you offers.
        </p>
      </div>
      <TaskForm />
    </div>
  );
}
