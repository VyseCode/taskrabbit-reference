"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TaskerDTO } from "@/lib/types";

const skillOptions = [
  "Cleaning",
  "Moving",
  "Handyman",
  "Plumbing",
  "Electrical",
  "Painting",
  "Gardening",
  "Tutoring",
  "Pet Care",
  "Delivery",
];

export function ProfileForm({ initial }: { initial: TaskerDTO | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      skills: String(form.get("skills") ?? "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      hourlyRate: Number(form.get("hourlyRate") ?? 0),
      location: String(form.get("location") ?? ""),
      bio: String(form.get("bio") ?? ""),
      availability: String(form.get("availability") ?? "available"),
    };

    try {
      const response = await fetch("/api/taskers/me", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not save your profile");
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

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20";
  const label = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <label htmlFor="skills" className={label}>
          Skills (comma separated)
        </label>
        <input
          id="skills"
          name="skills"
          required
          list="skill-options"
          defaultValue={initial?.skills.join(", ") ?? ""}
          className={input}
          placeholder="Cleaning, Handyman, Painting"
        />
        <datalist id="skill-options">
          {skillOptions.map((skill) => (
            <option key={skill} value={skill} />
          ))}
        </datalist>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hourlyRate" className={label}>
            Hourly rate (USD)
          </label>
          <input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            required
            min={1}
            max={1000}
            defaultValue={initial?.hourlyRate ?? 25}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="availability" className={label}>
            Availability
          </label>
          <select
            id="availability"
            name="availability"
            defaultValue={initial?.availability ?? "available"}
            className={input}
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="location" className={label}>
          Service area
        </label>
        <input
          id="location"
          name="location"
          required
          minLength={2}
          defaultValue={initial?.location ?? ""}
          className={input}
          placeholder="Austin, TX"
        />
      </div>

      <div>
        <label htmlFor="bio" className={label}>
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={1000}
          defaultValue={initial?.bio ?? ""}
          className={input}
          placeholder="What kind of work do you enjoy? What tools do you bring?"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-lg bg-[#e8f4ed] px-3 py-2 text-sm text-[#177245]">
          Profile saved.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-[#177245] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f5a36] disabled:opacity-60"
      >
        {loading ? "Saving..." : initial ? "Save changes" : "Create profile"}
      </button>
    </form>
  );
}
