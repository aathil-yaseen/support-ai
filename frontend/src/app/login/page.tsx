"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:4000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message[0]
            : data?.message || "Invalid email or password."
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-[#ecfdf5] via-white to-[#eff6ff]">

      <div className="flex min-h-screen">

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <section className="relative hidden w-[53%] overflow-hidden lg:flex">

          {/* Background gradients */}

          <div className="absolute inset-0 bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf9] to-[#eff6ff]" />

          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-emerald-100/60 blur-3xl" />

          <div className="absolute -bottom-48 left-20 h-[550px] w-[550px] rounded-full bg-teal-100/70 blur-3xl" />

          <div className="absolute right-[-150px] top-[-100px] h-[420px] w-[420px] rounded-full bg-cyan-100/70 blur-3xl" />

          {/* Decorative circles */}

          <div className="absolute left-[-180px] top-[42%] h-[600px] w-[600px] rounded-full border border-emerald-100/60" />

          <div className="absolute right-[-180px] bottom-[-180px] h-[500px] w-[500px] rounded-full border border-blue-100/70" />

          {/* Content */}

          <div className="relative z-10 flex w-full flex-col px-16 py-12 xl:px-20">

            {/* Logo */}

            <div>
              <button
                onClick={() => router.push("/")}
                className="text-3xl font-extrabold tracking-tight text-slate-900"
              >
                Support
                <span className="text-emerald-600">
                  AI
                </span>
              </button>

              <p className="mt-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                AI-Powered Customer Support
              </p>
            </div>

            {/* Hero */}

            <div className="mt-16 max-w-xl">

              <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-900 xl:text-[56px]">

                Smarter Support.

                <br />

                <span className="text-emerald-600">
                  Happier Customers.
                </span>

              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                Manage tickets, access knowledge, and deliver
                exceptional customer support with the power of AI.
              </p>

            </div>

            {/* Feature list */}

            <div className="mt-9 max-w-xl space-y-3">

              {/* AI */}

              <div className="flex items-center gap-4 rounded-2xl px-0 py-2">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-xl shadow-sm">
                  💬
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    AI-Powered Assistance
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Get instant answers from your knowledge base
                  </p>
                </div>

              </div>

              {/* Tickets */}

              <div className="flex items-center gap-4 rounded-2xl px-0 py-2">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-xl shadow-sm">
                  🎫
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Ticket Management
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Track and resolve customer issues efficiently
                  </p>
                </div>

              </div>

              {/* Knowledge */}

              <div className="flex items-center gap-4 rounded-2xl px-0 py-2">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-xl shadow-sm">
                  📖
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Knowledge Base
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Store and search support documentation
                  </p>
                </div>

              </div>

              {/* Insights */}

              <div className="flex items-center gap-4 rounded-2xl px-0 py-2">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-xl shadow-sm">
                  📊
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Better Insights
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Understand and improve your support
                  </p>
                </div>

              </div>

            </div>

            {/* AI illustration area */}

            <div className="relative mt-auto min-h-[210px]">

              {/* Floating message */}

              <div className="absolute left-[58%] top-3 rounded-2xl border border-white bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 shadow-xl shadow-emerald-100/70 backdrop-blur">
                How can I help?

                <div className="absolute -bottom-3 left-1/2 h-5 w-5 rotate-45 border-b border-r border-white bg-white" />
              </div>

              {/* Robot */}

              <div className="absolute bottom-[-8px] left-[60%]">

                {/* Antenna */}

                <div className="mx-auto flex h-10 w-10 flex-col items-center">
                  <div className="h-5 w-1 rounded-full bg-emerald-500" />
                  <div className="h-4 w-4 rounded-full bg-emerald-400 shadow-lg shadow-emerald-200" />
                </div>

                {/* Head */}

                <div className="relative flex h-32 w-44 items-center justify-center rounded-[38px] border-4 border-white bg-gradient-to-br from-white to-slate-100 shadow-2xl shadow-emerald-200">

                  {/* Left ear */}

                  <div className="absolute -left-5 h-12 w-7 rounded-full bg-emerald-400 shadow-lg shadow-emerald-100" />

                  {/* Right ear */}

                  <div className="absolute -right-5 h-12 w-7 rounded-full bg-emerald-400 shadow-lg shadow-emerald-100" />

                  {/* Face */}

                  <div className="flex h-20 w-32 items-center justify-center gap-7 rounded-[28px] bg-slate-900 shadow-inner">

                    <div className="h-4 w-4 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/50" />

                    <div className="h-4 w-4 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/50" />

                  </div>

                </div>

                {/* Body */}

                <div className="mx-auto mt-2 flex h-24 w-36 items-center justify-center rounded-[30px] border-4 border-white bg-gradient-to-br from-white to-slate-100 shadow-2xl">

                  <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-slate-900 text-xl text-emerald-300">
                    ♥
                  </div>

                </div>

              </div>

              {/* Analytics floating card */}

              <div className="absolute bottom-8 left-[82%] flex h-20 w-20 items-center justify-center rounded-2xl border border-white bg-white/90 shadow-xl shadow-emerald-100 backdrop-blur">

                <div className="flex items-end gap-1">

                  <span className="h-5 w-2 rounded-full bg-emerald-400" />
                  <span className="h-8 w-2 rounded-full bg-emerald-500" />
                  <span className="h-12 w-2 rounded-full bg-teal-500" />

                </div>

              </div>

              {/* Bottom message */}

              <div className="absolute bottom-[-5px] left-[70%] rounded-2xl border border-white bg-white/90 px-5 py-3 text-xs font-bold text-slate-700 shadow-xl shadow-emerald-100/70 backdrop-blur">
                <span className="text-emerald-500">
                  ⚡
                </span>{" "}
                Faster
                <br />
                Stronger
                <br />
                Happier
              </div>

            </div>

            {/* Quote */}

            <div className="absolute bottom-8 left-16 max-w-[300px] xl:left-20">

              <div className="text-5xl font-serif leading-none text-emerald-500">
                “
              </div>

              <p className="mt-1 font-serif text-lg italic leading-7 text-slate-600">
                Great support creates loyal customers.
              </p>

              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                — SupportAI
              </p>

            </div>

          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN SIDE
        ====================================================== */}

        <section className="flex w-full items-center justify-center px-5 py-10 lg:w-[47%] lg:px-12">

          <div className="w-full max-w-xl">

            {/* Mobile logo */}

            <div className="mb-8 text-center lg:hidden">

              <button
                onClick={() => router.push("/")}
                className="text-3xl font-extrabold tracking-tight text-slate-900"
              >
                Support
                <span className="text-emerald-600">
                  AI
                </span>
              </button>

              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                AI-Powered Customer Support
              </p>

            </div>

            {/* Login Card */}

            <div className="rounded-[28px] border border-white bg-white/95 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur-xl sm:p-10">

              {/* Logo */}

              <div className="text-center">

                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                  Support
                  <span className="text-emerald-600">
                    AI
                  </span>
                </h2>

                <p className="mt-3 text-lg text-slate-500">
                  Sign in to your support workspace
                </p>

              </div>

              {/* Error */}

              {error && (
                <div className="mt-7 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

                  <span>⚠️</span>

                  <span>{error}</span>

                </div>
              )}

              {/* Form */}

              <form
                onSubmit={handleLogin}
                className="mt-9 space-y-6"
              >

                {/* Email */}

                <div>

                  <label className="mb-2.5 block text-sm font-bold text-slate-700">
                    Email
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                      ✉
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                    />

                  </div>

                </div>

                {/* Password */}

                <div>

                  <div className="mb-2.5 flex items-center justify-between">

                    <label className="text-sm font-bold text-slate-700">
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          "Password recovery is not available yet."
                        )
                      }
                      className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                      🔒
                    </span>

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-base text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? "◉" : "◌"}
                    </button>

                  </div>

                </div>

                {/* Remember */}

                <div className="flex items-center justify-between">

                  <label className="flex cursor-pointer items-center gap-2.5">

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />

                    <span className="text-sm font-medium text-slate-600">
                      Remember me
                    </span>

                  </label>

                </div>

                {/* Sign In */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In

                      <span className="text-xl transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}

                </button>

              </form>

              {/* Divider */}

              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-sm font-medium text-slate-400">
                  OR
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>

              {/* Google */}

              <button
                type="button"
                onClick={() =>
                  setError(
                    "Google sign-in is not configured yet."
                  )
                }
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
              >

                <span className="text-lg font-extrabold text-blue-500">
                  G
                </span>

                Continue with Google

              </button>

              {/* Security */}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">

                <span className="text-emerald-500">
                  🛡
                </span>

                Secure authentication

              </div>

              {/* Register */}

              <p className="mt-7 text-center text-sm text-slate-500">

                Don&apos;t have an account?{" "}

                <button
                  type="button"
                  onClick={() =>
                    router.push("/register")
                  }
                  className="font-extrabold text-emerald-600 transition hover:text-emerald-700"
                >
                  Create one
                </button>

              </p>

            </div>

            {/* Footer */}

            <p className="mt-6 text-center text-xs text-slate-400">
              © 2026 SupportAI · Intelligent Customer Support
            </p>

          </div>

        </section>

      </div>
    </main>
  );
}