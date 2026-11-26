"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import type { OfferDTO, TaskDTO } from "@/lib/types";

type Props = {
  task: TaskDTO;
  offers: OfferDTO[];
  isOwner: boolean;
  currentUserId: string;
};

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20";

export function OffersPanel({ task, offers, isOwner, currentUserId }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [showForm, setShowForm] = useState(false);

  const myOffer = offers.find((offer) => offer.taskerId === currentUserId);

  async function act(url: string, body?: unknown, key = url) {
    setError("");
    setBusy(key);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "That action could not be completed");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setBusy("");
    }
  }

  function submitOffer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void act(`/api/tasks/${task.id}/offers`, {
      price: Number(form.get("price") ?? 0),
      estimatedHours: Number(form.get("hours") ?? 0),
      message: String(form.get("message") ?? ""),
    }, "submit");
    setShowForm(false);
  }

  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Offers</h2>
          <p className="mt-1 text-sm text-slate-500">
            {offers.length === 0
              ? "No offers yet."
              : `${offers.length} ${offers.length === 1 ? "offer" : "offers"} on this task`}
          </p>
        </div>
        {!isOwner && task.status === "open" && !myOffer && (
          <button
            type="button"
            onClick={() => setShowForm((open) => !open)}
            className="rounded-full bg-[#177245] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f5a36]"
          >
            {showForm ? "Cancel" : "Submit an offer"}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isOwner && ["open", "assigned", "in_progress"].includes(task.status) && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3">
          <span className="mr-auto text-xs font-semibold uppercase tracking-wide text-slate-500">
            Manage task
          </span>
          {task.status === "assigned" && (
            <button
              type="button"
              disabled={busy !== ""}
              onClick={() => void act(`/api/tasks/${task.id}/status`, { status: "in_progress" }, "start")}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#177245]"
            >
              Start work
            </button>
          )}
          {["assigned", "in_progress"].includes(task.status) && (
            <button
              type="button"
              disabled={busy !== ""}
              onClick={() => void act(`/api/tasks/${task.id}/status`, { status: "completed" }, "complete")}
              className="rounded-full bg-[#177245] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f5a36]"
            >
              Mark completed
            </button>
          )}
          {task.status !== "completed" && (
            <button
              type="button"
              disabled={busy !== ""}
              onClick={() => void act(`/api/tasks/${task.id}`, undefined, "cancel")}
              className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:border-red-400"
            >
              Cancel task
            </button>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={submitOffer} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[140px_140px_1fr_auto]">
          <label className="text-xs font-medium text-slate-600">
            Your price ($)
            <input aria-label="Offer price" name="price" type="number" required min={1} className={`mt-1 ${input}`} />
          </label>
          <label className="text-xs font-medium text-slate-600">
            Hours
            <input aria-label="Estimated hours" name="hours" type="number" required min={0.5} step={0.5} className={`mt-1 ${input}`} />
          </label>
          <label className="text-xs font-medium text-slate-600">
            Message
            <input aria-label="Offer message" name="message" maxLength={1000} placeholder="Why you're a good fit" className={`mt-1 ${input}`} />
          </label>
          <button type="submit" disabled={busy !== ""} className="self-end rounded-full bg-[#177245] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f5a36]">
            Send offer
          </button>
        </form>
      )}

      {offers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          {isOwner
            ? "Taskers can send offers once they find your task."
            : "Be the first to send this client an offer."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {offers.map((offer) => (
            <li key={offer.id} className="flex flex-wrap items-start gap-4 py-4 first:pt-0 last:pb-0">
              <Avatar name={offer.taskerName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{offer.taskerName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                    offer.status === "accepted"
                      ? "bg-[#e8f4ed] text-[#177245]"
                      : offer.status === "pending"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                  }`}>
                    {offer.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{offer.message || "No message included."}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(offer.createdAt).toLocaleDateString()} · {offer.estimatedHours}h estimated
                </p>
                {isOwner && offer.status === "pending" && task.status === "open" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={busy !== ""}
                      onClick={() => void act(`/api/offers/${offer.id}/accept`, undefined, offer.id)}
                      className="rounded-full bg-[#177245] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0f5a36]"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={busy !== ""}
                      onClick={() => void act(`/api/offers/${offer.id}/reject`, undefined, offer.id)}
                      className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {!isOwner && offer.taskerId === currentUserId && offer.status === "pending" && (
                  <button
                    type="button"
                    disabled={busy !== ""}
                    onClick={() => void act(`/api/offers/${offer.id}/withdraw`, undefined, offer.id)}
                    className="mt-3 rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:border-red-300 hover:text-red-600"
                  >
                    Withdraw offer
                  </button>
                )}
              </div>
              <p className="text-lg font-bold text-slate-900">${offer.price}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
