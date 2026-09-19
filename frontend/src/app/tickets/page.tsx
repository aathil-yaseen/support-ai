"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
};

export default function TicketsPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const loadTickets = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:4000/tickets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load tickets");
        }

        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error("Failed to load tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [router]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        ticket.title.toLowerCase().includes(searchText) ||
        ticket.description.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const openCount = tickets.filter(
    (ticket) => ticket.status === "OPEN"
  ).length;

  const progressCount = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) =>
      ticket.status === "RESOLVED" ||
      ticket.status === "CLOSED"
  ).length;

  const highPriorityCount = tickets.filter(
    (ticket) =>
      ticket.priority === "HIGH" ||
      ticket.priority === "CRITICAL"
  ).length;

  const formatStatus = (status: string) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "OPEN":
        return {
          badge:
            "bg-emerald-100 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          border: "border-l-emerald-500",
          glow: "hover:shadow-emerald-100",
        };

      case "IN_PROGRESS":
        return {
          badge:
            "bg-blue-100 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          border: "border-l-blue-500",
          glow: "hover:shadow-blue-100",
        };

      case "WAITING_FOR_CUSTOMER":
        return {
          badge:
            "bg-amber-100 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          border: "border-l-amber-500",
          glow: "hover:shadow-amber-100",
        };

      case "RESOLVED":
        return {
          badge:
            "bg-violet-100 text-violet-700 border-violet-200",
          dot: "bg-violet-500",
          border: "border-l-violet-500",
          glow: "hover:shadow-violet-100",
        };

      case "CLOSED":
        return {
          badge:
            "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
          border: "border-l-slate-400",
          glow: "hover:shadow-slate-100",
        };

      default:
        return {
          badge:
            "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
          border: "border-l-slate-400",
          glow: "hover:shadow-slate-100",
        };
    }
  };

  const priorityStyle = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-100";

      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-100";

      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-blue-50">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">

        {/* ================= HEADER ================= */}

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-7 text-white shadow-xl shadow-emerald-200/60">

          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                  ✦
                </span>

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
                  SupportAI Workspace
                </span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight">
                Customer Tickets
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">
                Manage customer requests, monitor support progress,
                and keep every conversation organized in one place.
              </p>
            </div>

            <button
              onClick={() => router.push("/tickets/new")}
              className="group flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-xl"
            >
              <span className="text-xl">+</span>
              New Ticket
            </button>

          </div>
        </section>

        {/* ================= STATS ================= */}

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total */}
          <div className="group overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-100">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Total Tickets
                </p>

                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {tickets.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  All support requests
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                💬
              </div>

            </div>
          </div>

          {/* Open */}
          <div className="group overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Open
                </p>

                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {openCount}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Awaiting action
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-200">
                ●
              </div>

            </div>
          </div>

          {/* In Progress */}
          <div className="group overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {progressCount}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Currently handling
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200">
                ◷
              </div>

            </div>
          </div>

          {/* Resolved */}
          <div className="group overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  Resolved
                </p>

                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {resolvedCount}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Successfully completed
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-200">
                ✓
              </div>

            </div>
          </div>

        </section>

        {/* ================= AI INSIGHT ================= */}

        <section className="mb-7 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-xl">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-xl shadow-lg shadow-emerald-900/40">
                ✨
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  AI Support Insights
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  Your support workspace at a glance
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  {highPriorityCount > 0
                    ? `${highPriorityCount} high-priority ticket${
                        highPriorityCount > 1 ? "s" : ""
                      } require attention.`
                    : "No high-priority tickets currently require attention."}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
                <p className="text-lg font-bold text-emerald-300">
                  {tickets.length}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Tickets
                </p>
              </div>

              <div className="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
                <p className="text-lg font-bold text-orange-300">
                  {highPriorityCount}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Priority
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ================= SEARCH / FILTER ================= */}

        <section className="mb-6 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-lg shadow-slate-200/50 backdrop-blur">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative w-full lg:max-w-xl">

              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>

              <input
                type="text"
                placeholder="Search by ticket title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />

            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">

              {[
                ["ALL", "All"],
                ["OPEN", "Open"],
                ["IN_PROGRESS", "In Progress"],
                ["RESOLVED", "Resolved"],
              ].map(([value, label]) => (

                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    statusFilter === value
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  }`}
                >
                  {label}
                </button>

              ))}

            </div>

          </div>
        </section>

        {/* ================= LIST HEADER ================= */}

        <div className="mb-4 flex items-end justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              Support Requests
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
              Recent Tickets
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredTickets.length} ticket
              {filteredTickets.length !== 1 ? "s" : ""} displayed
            </p>
          </div>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Clear search
            </button>
          )}

        </div>

        {/* ================= TICKET LIST ================= */}

        {loading ? (

          <div className="rounded-2xl border border-white bg-white/80 p-16 text-center shadow-lg">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />

            <p className="text-sm font-semibold text-slate-500">
              Loading your tickets...
            </p>

          </div>

        ) : filteredTickets.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-16 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 text-2xl text-emerald-600">
              🔍
            </div>

            <h3 className="mt-5 text-xl font-extrabold text-slate-900">
              No tickets found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              No tickets match your current search or filter.
              Try another search or create a new support ticket.
            </p>

            <div className="mt-6 flex justify-center gap-3">

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                >
                  Clear Search
                </button>
              )}

              <button
                onClick={() => router.push("/tickets/new")}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
              >
                + Create Ticket
              </button>

            </div>

          </div>

        ) : (

          <div className="space-y-4">

            {filteredTickets.map((ticket) => {

              const status = statusStyle(ticket.status);

              return (
                <article
                  key={ticket.id}
                  onClick={() =>
                    router.push(`/tickets/${ticket.id}`)
                  }
                  className={`group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 border-l-4 bg-white p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${status.border} ${status.glow}`}
                >

                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    {/* Ticket information */}
                    <div className="flex min-w-0 items-start gap-4">

                      {/* Ticket ID */}
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-sm font-extrabold text-emerald-700 shadow-sm">

                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />

                        #{ticket.id}
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="truncate text-lg font-extrabold text-slate-900 transition group-hover:text-emerald-700">
                            {ticket.title}
                          </h3>

                          <span className="text-slate-300">
                            •
                          </span>

                          <span className="text-xs font-medium text-slate-400">
                            {new Date(
                              ticket.createdAt
                            ).toLocaleDateString()}
                          </span>

                        </div>

                        <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
                          {ticket.description}
                        </p>

                      </div>

                    </div>

                    {/* Status / Priority */}
                    <div className="flex shrink-0 items-center gap-2 pl-16 md:pl-0">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide ${status.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />

                        {formatStatus(ticket.status)}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide ${priorityStyle(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>

                      <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-emerald-50 group-hover:text-emerald-600">
                        →
                      </span>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}