"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<"client" | "tasker">("client");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload =
      mode === "register"
        ? {
            name: String(form.get("name") ?? ""),
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
            role,
          }
        : {
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
          };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/marketplace");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === "register";
  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20";

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f8f5]">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#177245] text-lg font-bold text-white">
          T
        </span>
        <span className="text-sm font-semibold tracking-tight text-slate-700">
          Taskly
        </span>
      </div>

      <div className="flex flex-1 items-start justify-center px-4 py-8 sm:items-center">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-center text-3xl font-semibold tracking-tight text-slate-900">
            {isRegister ? "Join Taskly" : "Welcome back"}
          </h1>
          <p className="mb-6 text-center text-sm text-slate-500">
            {isRegister
              ? "Local help for the things on your list."
              : "Sign in to find trusted local help."}
          </p>

          <form
            onSubmit={submit}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            {isRegister && (
              <>
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    minLength={2}
                    autoComplete="name"
                    className={inputClass}
                    placeholder="Jane Doe"
                  />
                </div>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-slate-700">
                    I want to
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(["client", "tasker"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRole(option)}
                        aria-pressed={role === option}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                          role === option
                            ? "border-[#177245] bg-[#e8f4ed] text-[#177245]"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {option === "client" ? "Post tasks" : "Offer skills"}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={isRegister ? 8 : 1}
                autoComplete={isRegister ? "new-password" : "current-password"}
                className={inputClass}
                placeholder="••••••••"
              />
              {isRegister && (
                <p className="mt-1 text-xs text-slate-500">At least 8 characters</p>
              )}
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#177245] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f5a36] disabled:opacity-60"
            >
              {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            {isRegister ? "Already have an account? " : "New to Taskly? "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-semibold text-[#177245] hover:underline"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>

          {!isRegister && (
            <p className="mt-6 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-center text-xs text-slate-600">
              Demo: <strong>priya@example.com</strong> (client) or{" "}
              <strong>daniel@example.com</strong> (tasker) / <strong>password123</strong>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
