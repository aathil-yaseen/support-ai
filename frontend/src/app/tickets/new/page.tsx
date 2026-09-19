"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTicketPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:4000/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
          userId: 1,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const ticket = await response.json();

      router.push(`/tickets/${ticket.id}`);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to create the ticket. Please make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9] text-[#17221D]">
      {/* Navbar */}
      <nav className="border-b border-[#E2EAE5] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={() => router.push("/")}
            className="text-xl font-bold tracking-tight text-[#168A5B]"
          >
            SupportAI
          </button>

          <div className="flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => router.push("/")}
              className="text-[#66736C] transition hover:text-[#168A5B]"
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/")}
              className="text-[#66736C] transition hover:text-[#168A5B]"
            >
              Tickets
            </button>

            <button
              onClick={() => router.push("/knowledge")}
              className="text-[#66736C] transition hover:text-[#168A5B]"
            >
              Knowledge
            </button>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F7EF] font-semibold text-[#168A5B]">
            A
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="mb-8 text-sm font-medium text-[#66736C] transition hover:text-[#168A5B]"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#168A5B]">
            Support Workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Create New Ticket
          </h1>

          <p className="mt-2 text-[#66736C]">
            Describe your issue and our support system will help analyze it.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-[#E2EAE5] bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold"
              >
                Ticket Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unable to login to my account"
                className="w-full rounded-xl border border-[#D9E3DD] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#9AA59F] focus:border-[#168A5B] focus:ring-2 focus:ring-[#E8F7EF]"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the issue in detail..."
                rows={7}
                className="w-full resize-none rounded-xl border border-[#D9E3DD] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#9AA59F] focus:border-[#168A5B] focus:ring-2 focus:ring-[#E8F7EF]"
              />
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="mb-2 block text-sm font-semibold"
              >
                Priority
              </label>

              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-[#D9E3DD] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#168A5B] focus:ring-2 focus:ring-[#E8F7EF]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-4 border-t border-[#E8EEEA] pt-6">
              <button
                type="button"
                onClick={() => router.push("/")}
                disabled={loading}
                className="rounded-xl border border-[#D9E3DD] px-5 py-3 text-sm font-semibold text-[#66736C] transition hover:bg-[#F8FAF9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#168A5B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#11764D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}