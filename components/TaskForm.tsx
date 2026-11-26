"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export function TaskForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date") ?? "");
    const payload = {
      category: String(form.get("category") ?? ""),
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      location: String(form.get("location") ?? ""),
      date: date ? new Date(`${date}T23:59:59`).toISOString() : "",
      budget: Number(form.get("budget") ?? 0),
    };

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        task?: { id: string };
      };
      if (!response.ok || !data.task) {
        setError(data.error ?? "Could not create the task");
        return;
      }
      router.push(`/tasks/${data.task.id}`);
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20";
  const label = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <label htmlFor="title" className={label}>
          Task title
        </label>
        <input id="title" name="title" required minLength={5} maxLength={120} className={input} placeholder="e.g. Deep clean my apartment" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={label}>
            Category
          </label>
          <select id="category" name="category" required defaultValue="" className={input}>
            <option value="" disabled>
              Choose a category
            </option>
            {CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="budget" className={label}>
            Budget (USD)
          </label>
          <input id="budget" name="budget" type="number" required min={1} max={100000} className={input} placeholder="120" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="location" className={label}>
            Location
          </label>
          <input id="location" name="location" required minLength={2} className={input} placeholder="Austin, TX" />
        </div>
        <div>
          <label htmlFor="date" className={label}>
            Preferred date
          </label>
          <input id="date" name="date" type="date" required className={input} />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={label}>
          Description
        </label>
        <textarea id="description" name="description" required minLength={10} maxLength={3000} rows={5} className={input} placeholder="Tell taskers what needs to be done..." />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-[#177245] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f5a36] disabled:opacity-60"
      >
        {loading ? "Publishing..." : "Publish task"}
      </button>
    </form>
  );
}
