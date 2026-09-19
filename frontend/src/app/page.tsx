"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt?: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<
    "CHECKING" | "OPERATIONAL" | "UNAVAILABLE"
  >("CHECKING");

  useEffect(() => {
    loadUser();
    loadTickets();
  }, []);

  const loadUser = () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Failed to read user information:", error);
      localStorage.removeItem("user");
    }
  };

  const loadTickets = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.replace("/login");
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
        window.location.replace("/login");
        return;
      }

      if (response.status === 403) {
        setSystemStatus("UNAVAILABLE");
        throw new Error(
          "You do not have permission to view these tickets"
        );
      }

      if (!response.ok) {
        setSystemStatus("UNAVAILABLE");
        throw new Error("Failed to load tickets");
      }

      const data = await response.json();

      setTickets(data);
      setSystemStatus("OPERATIONAL");
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setProfileOpen(false);

    window.location.replace("/login");
  };

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) =>
      ticket.status === "OPEN" ||
      ticket.status === "IN_PROGRESS"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "RESOLVED" ||
      ticket.status === "CLOSED"
  ).length;

  const highPriorityTickets = tickets.filter(
    (ticket) =>
      ticket.priority === "HIGH" ||
      ticket.priority === "CRITICAL"
  ).length;

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "No email available";
  const displayRole = user?.role || "USER";

  const formattedRole =
    displayRole.charAt(0) +
    displayRole.slice(1).toLowerCase();

  return (
    <div className="min-h-screen bg-[#F3F8F5] text-[#10271E]">

      {/* ================= SIDEBAR ================= */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[272px] flex-col overflow-hidden bg-gradient-to-b from-[#063C2B] via-[#073F2D] to-[#052F22] px-5 py-6 text-white shadow-[12px_0_40px_rgba(4,54,39,0.10)] lg:flex">

        <div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />

        {/* Logo */}

        <div className="relative mb-10 flex items-center gap-3 px-2">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white text-xl font-black text-[#12895A] shadow-[0_10px_25px_rgba(0,0,0,0.18)]">
            S
          </div>

          <div>
            <h1 className="text-[19px] font-black tracking-[-0.02em]">
              SupportAI
            </h1>

            <p className="mt-0.5 text-[11px] font-medium tracking-wide text-emerald-100/60">
              Intelligent Support
            </p>
          </div>

        </div>

        {/* Navigation */}

        <div className="relative">

          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/35">
            Workspace
          </p>

          <nav className="space-y-1.5">

            <SidebarItem
              label="Dashboard"
              icon="⌂"
              active
              onClick={() => router.push("/")}
            />

            <SidebarItem
              label="Tickets"
              icon="▣"
              onClick={() => router.push("/tickets")}
            />

            <SidebarItem
              label="Knowledge"
              icon="◈"
              onClick={() => router.push("/knowledge")}
            />

          </nav>

        </div>

        {/* AI Status */}

        <div className="relative mt-8 overflow-hidden rounded-[20px] border border-emerald-200/15 bg-white/[0.065] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_rgba(0,0,0,0.08)] backdrop-blur-sm">

          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-300/10 blur-2xl" />

          <div className="relative mb-3 flex items-center justify-between">

            <div className="flex items-center gap-2.5">

              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />

              <span className="text-xs font-extrabold text-white">
                AI Features
              </span>

            </div>

            <span className="rounded-full bg-emerald-300/10 px-2 py-1 text-[9px] font-black tracking-wider text-emerald-200">
              READY
            </span>

          </div>

          <p className="relative text-[11px] font-medium leading-5 text-white/55">
            Classification, sentiment analysis, semantic search and smart
            response generation are available.
          </p>

        </div>

        <div className="flex-1" />

        {/* Profile */}

        <div className="relative">

          {profileOpen && (
            <div className="absolute bottom-[72px] left-0 right-0 z-50 overflow-hidden rounded-[18px] border border-[#DCE9E2] bg-white shadow-[0_24px_55px_rgba(3,43,30,0.28)]">

              <div className="border-b border-[#E8F0EC] bg-[#F8FBF9] px-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF7F0] text-sm font-black text-[#168A5B]">
                    {displayName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-extrabold text-[#10271E]">
                      {displayName}
                    </p>

                    <p className="mt-1 truncate text-[10px] font-medium text-[#718078]">
                      {displayEmail}
                    </p>

                  </div>

                </div>

              </div>

              <div className="space-y-2 p-3">

                <div className="rounded-xl bg-[#F5FAF7] px-3 py-2.5">

                  <p className="text-[9px] font-black uppercase tracking-wider text-[#8A9A92]">
                    Role
                  </p>

                  <p className="mt-1 text-xs font-extrabold text-[#18352A]">
                    {formattedRole}
                  </p>

                </div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-red-600 transition hover:bg-red-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                    ↪
                  </span>

                  Logout
                </button>

              </div>

            </div>
          )}

          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className={`flex w-full items-center gap-3 rounded-[18px] border px-3 py-3 text-left transition-all duration-200 ${
              profileOpen
                ? "border-white/15 bg-white/10"
                : "border-transparent hover:border-white/10 hover:bg-white/[0.07]"
            }`}
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-emerald-50 text-sm font-black text-[#12895A] shadow-[0_8px_18px_rgba(0,0,0,0.16)]">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-xs font-extrabold text-white">
                {displayName}
              </p>

              <p className="mt-0.5 truncate text-[10px] font-medium text-white/50">
                {formattedRole}
              </p>

            </div>

            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-black text-white/60">
              {profileOpen ? "⌃" : "⌄"}
            </span>

          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="min-h-screen lg:ml-[272px]">

        {/* Header */}

        <header className="sticky top-0 z-30 flex min-h-[82px] items-center justify-between border-b border-[#DFEAE4] bg-white/90 px-5 backdrop-blur-xl sm:px-7 lg:px-10">

          <div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#168A5B]">
              Overview
            </p>

            <h2 className="mt-1 text-xl font-black tracking-[-0.025em] text-[#10271E] sm:text-2xl">
              Support Dashboard
            </h2>

          </div>

          <div className="flex items-center gap-2.5">

            {/* Dynamic backend status */}

            <div className="hidden items-center gap-2 rounded-full border border-[#D7E7DF] bg-[#F4FAF7] px-3.5 py-2 text-[11px] font-extrabold text-[#52675D] sm:flex">

              <span
                className={`h-2 w-2 rounded-full ${
                  systemStatus === "OPERATIONAL"
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    : systemStatus === "UNAVAILABLE"
                    ? "bg-red-400"
                    : "bg-amber-400"
                }`}
              />

              {systemStatus === "OPERATIONAL"
                ? "System Operational"
                : systemStatus === "UNAVAILABLE"
                ? "System Unavailable"
                : "Checking System"}
            </div>

            <button
              onClick={() => router.push("/tickets/new")}
              className="rounded-xl bg-gradient-to-r from-[#168A5B] to-[#119565] px-4 py-2.5 text-xs font-black text-white shadow-[0_10px_24px_rgba(22,138,91,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(22,138,91,0.30)] sm:px-5 sm:py-3 sm:text-sm"
            >
              + New Ticket
            </button>

          </div>

        </header>

        <div className="p-5 sm:p-7 lg:p-10">

          {/* ================= HERO ================= */}

          <section className="relative min-h-[500px] overflow-hidden rounded-[30px] bg-gradient-to-br from-[#052F22] via-[#074630] to-[#106F4C] shadow-[0_25px_65px_rgba(5,59,42,0.18)] sm:min-h-[520px] lg:min-h-[545px]">

            <div className="pointer-events-none absolute -right-24 -top-28 h-[420px] w-[420px] rounded-full bg-emerald-300/10 blur-3xl" />

            <div className="pointer-events-none absolute bottom-[-160px] left-[25%] h-[360px] w-[360px] rounded-full bg-emerald-200/10 blur-3xl" />

            <div className="relative z-10 flex min-h-[500px] flex-col justify-center px-7 py-12 sm:px-9 lg:min-h-[545px] lg:px-12 xl:max-w-[67%]">

              <div className="mb-7">

                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-4 py-2 text-[10px] font-black tracking-[0.12em] text-emerald-100 shadow-[0_8px_22px_rgba(16,185,129,0.08)]">

                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />

                  AI WORKSPACE

                </span>

              </div>

              <h1 className="max-w-3xl text-[42px] font-black leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">

                Smarter support.

                <span className="block bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                  Faster resolutions.
                </span>

              </h1>

              <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-emerald-50/75 sm:text-[15px] lg:text-base">
                Manage customer conversations, analyze support requests and
                generate intelligent responses with AI-powered assistance.
              </p>

              <div className="mt-8 flex flex-wrap gap-2.5">
                <FeaturePill text="✦ AI Classification" />
                <FeaturePill text="✦ Semantic Search" />
                <FeaturePill text="✦ Smart Responses" />
              </div>

            </div>

            {/* AI Capabilities */}

            <div className="absolute right-8 top-1/2 hidden w-[370px] -translate-y-1/2 xl:block">

              <div className="rounded-[26px] border border-white/15 bg-white/[0.095] p-5 shadow-[0_30px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl">

                <div className="mb-5 flex items-start justify-between">

                  <div>

                    <p className="text-sm font-black text-white">
                      AI Capabilities
                    </p>

                    <p className="mt-1 text-[10px] font-medium text-white/45">
                      Available support intelligence
                    </p>

                  </div>

                  <span className="rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-black tracking-wider text-emerald-200">
                    READY
                  </span>

                </div>

                <div className="space-y-2.5">

                  <AICapability
                    icon="✦"
                    title="Ticket Classification"
                    description="Categorize incoming support requests"
                  />

                  <AICapability
                    icon="◎"
                    title="Sentiment Analysis"
                    description="Analyze customer sentiment"
                  />

                  <AICapability
                    icon="↗"
                    title="Smart Responses"
                    description="Generate context-aware responses"
                  />

                  <AICapability
                    icon="◈"
                    title="Semantic Search"
                    description="Retrieve relevant knowledge"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* ================= STATS ================= */}

          <section className="mt-10">

            <div className="mb-5 flex items-end justify-between">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#168A5B]">
                  Support Overview
                </p>

                <h2 className="mt-1.5 text-2xl font-black tracking-[-0.035em] text-[#10271E]">
                  System performance
                </h2>

              </div>

              <span className="hidden rounded-full border border-[#D9E9E1] bg-white px-3 py-1.5 text-[10px] font-bold text-[#6D7D75] shadow-[0_5px_15px_rgba(22,138,91,0.05)] sm:block">
                Live metrics
              </span>

            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <DashboardStat
                title="Total Tickets"
                value={loading ? "—" : String(totalTickets)}
                icon="▣"
                description="All support tickets"
                accent="blue"
              />

              <DashboardStat
                title="Open Tickets"
                value={loading ? "—" : String(openTickets)}
                icon="◷"
                description="Awaiting resolution"
                accent="amber"
              />

              <DashboardStat
                title="Resolved"
                value={loading ? "—" : String(resolvedTickets)}
                icon="✓"
                description="Resolved or closed"
                accent="green"
              />

              <DashboardStat
                title="High Priority"
                value={loading ? "—" : String(highPriorityTickets)}
                icon="!"
                description="Needs attention"
                accent="red"
              />

            </div>

          </section>

          {/* ================= RECENT TICKETS ================= */}

          <section className="mt-10">

            <div className="mb-5 flex items-end justify-between">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#168A5B]">
                  Customer Activity
                </p>

                <h2 className="mt-1.5 text-2xl font-black tracking-[-0.035em] text-[#10271E]">
                  Recent Tickets
                </h2>

              </div>

              <button
                onClick={() => router.push("/tickets")}
                className="hidden rounded-lg px-2 py-1 text-sm font-black text-[#168A5B] transition hover:bg-[#EAF6F0] hover:text-[#0D6B46] sm:block"
              >
                View all →
              </button>

            </div>

            {loading ? (

              <div className="rounded-[20px] border border-[#DFEAE4] bg-white p-8 text-center text-sm font-semibold text-[#718078] shadow-[0_10px_28px_rgba(22,138,91,0.06)]">
                Loading tickets...
              </div>

            ) : tickets.length === 0 ? (

              <div className="rounded-[22px] border border-dashed border-[#CFE0D8] bg-white p-10 text-center shadow-[0_12px_30px_rgba(22,138,91,0.07)]">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF6F0] text-xl font-black text-[#168A5B] shadow-[0_8px_20px_rgba(22,138,91,0.10)]">
                  ▣
                </div>

                <h3 className="mt-4 text-base font-black text-[#18352A]">
                  No tickets yet
                </h3>

                <p className="mt-2 text-sm font-medium text-[#718078]">
                  Create your first support ticket to get started.
                </p>

                <button
                  onClick={() => router.push("/tickets/new")}
                  className="mt-5 rounded-xl bg-[#168A5B] px-5 py-2.5 text-sm font-black text-white shadow-[0_10px_22px_rgba(22,138,91,0.20)] transition hover:-translate-y-0.5 hover:bg-[#0D754C]"
                >
                  Create Ticket
                </button>

              </div>

            ) : (

              <div className="space-y-3.5">

                {tickets.slice(0, 5).map((ticket) => (

                  <button
                    key={ticket.id}
                    onClick={() =>
                      router.push(`/tickets/${ticket.id}`)
                    }
                    className="group flex w-full items-center gap-4 rounded-[20px] border border-[#DCE9E2] bg-white p-4 text-left shadow-[0_8px_22px_rgba(22,138,91,0.055)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BFD9CC] hover:shadow-[0_18px_38px_rgba(22,138,91,0.12)] sm:p-5"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#EFF9F4] to-[#E3F3EB] text-sm font-black text-[#168A5B] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                      #{ticket.id}
                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="truncate text-sm font-black text-[#17352A] sm:text-[15px]">
                        {ticket.title}
                      </h3>

                      <p className="mt-1 truncate text-xs font-medium text-[#718078] sm:text-sm">
                        {ticket.description}
                      </p>

                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-black text-[#A2B0A9] transition-all group-hover:translate-x-1 group-hover:bg-[#EAF6F0] group-hover:text-[#168A5B]">
                      →
                    </span>

                  </button>

                ))}

              </div>

            )}

          </section>

          {/* ================= QUICK ACTIONS ================= */}

          <section className="mt-10 grid gap-5 lg:grid-cols-3">

            <QuickAction
              icon="+"
              title="Create New Ticket"
              description="Open a new customer support request."
              onClick={() => router.push("/tickets/new")}
            />

            <QuickAction
              icon="◈"
              title="Knowledge Base"
              description="Search and manage AI knowledge documents."
              onClick={() => router.push("/knowledge")}
            />

            <div className="group relative overflow-hidden rounded-[22px] border border-emerald-200 bg-gradient-to-br from-[#E6F7EF] via-[#F3FBF7] to-[#DDF3E8] p-6 shadow-[0_12px_30px_rgba(22,138,91,0.10),0_4px_12px_rgba(22,138,91,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_22px_45px_rgba(22,138,91,0.18),0_6px_18px_rgba(22,138,91,0.09)]">

              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-300/25 blur-3xl transition-all duration-500 group-hover:bg-emerald-300/40" />

              <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />

              <div className="relative flex h-12 w-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#168A5B] to-[#087449] text-xl font-black text-white shadow-[0_10px_24px_rgba(22,138,91,0.28)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_14px_30px_rgba(22,138,91,0.35)]">
                ✦
              </div>

              <h3 className="relative mt-5 text-base font-black tracking-[-0.01em] text-[#12352A]">
                AI Assistant
              </h3>

              <p className="relative mt-2 text-sm font-medium leading-6 text-[#60776D]">
                AI tools are ready to classify, analyze and respond to support
                tickets.
              </p>

              <div className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-3 py-1.5 text-[11px] font-black text-[#168A5B] shadow-[0_5px_12px_rgba(22,138,91,0.06)]">

                <span className="h-2.5 w-2.5 rounded-full bg-[#168A5B] shadow-[0_0_9px_rgba(22,138,91,0.55)]" />

                AI features ready

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

/* ================= SIDEBAR ITEM ================= */

function SidebarItem({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left text-sm font-extrabold transition-all duration-200 ${
        active
          ? "bg-white text-[#073B2A] shadow-[0_10px_25px_rgba(0,0,0,0.14)]"
          : "text-white/60 hover:bg-white/[0.08] hover:text-white"
      }`}
    >

      <span
        className={`flex h-8 w-8 items-center justify-center rounded-[10px] text-sm transition ${
          active
            ? "bg-[#EAF7F0] text-[#168A5B]"
            : "bg-white/[0.045] text-emerald-100/65 group-hover:bg-white/10 group-hover:text-emerald-200"
        }`}
      >
        {icon}
      </span>

      <span>{label}</span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#168A5B]" />
      )}

    </button>
  );
}

/* ================= FEATURE PILL ================= */

function FeaturePill({ text }: { text: string }) {
  return (
    <span className="rounded-xl border border-white/15 bg-white/[0.07] px-4 py-2.5 text-[10px] font-black text-white/90 shadow-[0_6px_16px_rgba(0,0,0,0.08)] backdrop-blur">
      {text}
    </span>
  );
}

/* ================= AI CAPABILITY ================= */

function AICapability({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[17px] border border-white/10 bg-white/[0.065] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-sm font-black text-emerald-300">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[11px] font-black text-white">
          {title}
        </p>

        <p className="mt-1 text-[9px] font-medium leading-4 text-white/45">
          {description}
        </p>

      </div>

      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />

    </div>
  );
}

/* ================= DASHBOARD STAT ================= */

function DashboardStat({
  title,
  value,
  icon,
  description,
  accent,
}: {
  title: string;
  value: string;
  icon: string;
  description: string;
  accent: "blue" | "amber" | "green" | "red";
}) {
  const accentStyles = {
    blue: {
      border: "border-blue-100",
      top: "bg-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      dot: "bg-blue-500",
      shadow:
        "0 10px 30px rgba(59,130,246,0.12), 0 5px 14px rgba(22,138,91,0.07)",
      hover:
        "0 20px 45px rgba(59,130,246,0.20), 0 8px 20px rgba(22,138,91,0.10)",
    },

    amber: {
      border: "border-amber-100",
      top: "bg-amber-500",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      dot: "bg-amber-500",
      shadow:
        "0 10px 30px rgba(245,158,11,0.13), 0 5px 14px rgba(22,138,91,0.07)",
      hover:
        "0 20px 45px rgba(245,158,11,0.20), 0 8px 20px rgba(22,138,91,0.10)",
    },

    green: {
      border: "border-emerald-100",
      top: "bg-emerald-500",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      dot: "bg-emerald-500",
      shadow:
        "0 10px 30px rgba(16,185,129,0.14), 0 5px 14px rgba(22,138,91,0.08)",
      hover:
        "0 20px 45px rgba(16,185,129,0.22), 0 8px 20px rgba(22,138,91,0.12)",
    },

    red: {
      border: "border-red-100",
      top: "bg-red-500",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      dot: "bg-red-500",
      shadow:
        "0 10px 30px rgba(239,68,68,0.12), 0 5px 14px rgba(22,138,91,0.07)",
      hover:
        "0 20px 45px rgba(239,68,68,0.20), 0 8px 20px rgba(22,138,91,0.10)",
    },
  };

  const style = accentStyles[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-[20px] border bg-white p-6 transition-all duration-300 hover:-translate-y-1 ${style.border}`}
      style={{ boxShadow: style.shadow }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = style.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = style.shadow;
      }}
    >

      <div
        className={`absolute left-0 right-0 top-0 h-1 ${style.top}`}
      />

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#6B7C73]">
            {title}
          </p>

          <p className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#10271E]">
            {value}
          </p>

        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-[15px] text-xl font-black shadow-[0_6px_15px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:scale-110 ${style.iconBg} ${style.iconColor}`}
        >
          {icon}
        </div>

      </div>

      <div className="mt-5 flex items-center gap-2">

        <span className={`h-2 w-2 rounded-full ${style.dot}`} />

        <p className="text-[11px] font-semibold text-[#718078]">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ================= QUICK ACTION ================= */

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-[22px] border border-[#D5E8DE] bg-white p-6 text-left shadow-[0_12px_30px_rgba(22,138,91,0.07),0_4px_12px_rgba(22,138,91,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#BBD9C9] hover:shadow-[0_22px_45px_rgba(22,138,91,0.15),0_7px_18px_rgba(22,138,91,0.08)]"
    >

      <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-emerald-100/60 blur-3xl opacity-0 transition-all duration-500 group-hover:opacity-100" />

      <div className="relative flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#EAF7F0] text-xl font-black text-[#168A5B] shadow-[0_7px_18px_rgba(22,138,91,0.08)] transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#168A5B] group-hover:to-[#0C754C] group-hover:text-white group-hover:shadow-[0_12px_25px_rgba(22,138,91,0.25)]">
        {icon}
      </div>

      <h3 className="relative mt-5 text-base font-black tracking-[-0.01em] text-[#17352A]">
        {title}
      </h3>

      <p className="relative mt-2 text-sm font-medium leading-6 text-[#718078]">
        {description}
      </p>

      <div className="relative mt-5 inline-flex items-center gap-1 text-xs font-black text-[#168A5B] transition-all duration-200 group-hover:translate-x-1">
        Open
        <span className="text-sm">→</span>
      </div>

    </button>
  );
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "border-blue-100 bg-blue-50 text-blue-700",
    IN_PROGRESS: "border-amber-100 bg-amber-50 text-amber-700",
    WAITING_FOR_CUSTOMER:
      "border-purple-100 bg-purple-50 text-purple-700",
    RESOLVED:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    CLOSED:
      "border-gray-100 bg-gray-50 text-gray-600",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${
        styles[status] ??
        "border-gray-100 bg-gray-50 text-gray-600"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

/* ================= PRIORITY BADGE ================= */

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    LOW: "border-gray-100 bg-gray-50 text-gray-600",
    MEDIUM: "border-blue-100 bg-blue-50 text-blue-700",
    HIGH: "border-amber-100 bg-amber-50 text-amber-700",
    CRITICAL: "border-red-100 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${
        styles[priority] ??
        "border-gray-100 bg-gray-50 text-gray-600"
      }`}
    >
      {priority}
    </span>
  );
}