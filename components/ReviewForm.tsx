"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewForm({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          rating,
          comment: String(form.get("comment") ?? ""),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not submit your review");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Leave a review</h2>
        <p className="mt-1 text-sm text-slate-500">How did the tasker do? Your rating updates their profile.</p>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              aria-pressed={rating === value}
              className={`h-9 w-9 rounded-lg text-lg transition ${
                value <= rating ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="comment" className="mb-1 block text-sm font-medium text-slate-700">
          Comment
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          maxLength={1000}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20"
          placeholder="What went well?"
        />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {saved && (
        <p role="status" className="rounded-lg bg-[#e8f4ed] px-3 py-2 text-sm text-[#177245]">
          Review submitted. Thank you!
        </p>
      )}
      <button
        type="submit"
        disabled={loading || saved}
        className="rounded-full bg-[#177245] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f5a36] disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
