"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Message = {
  id: number;
  content: string;
  userId: number;
  createdAt: string;
};

type AIAnalysis = {
  id: number;
  type: string;
  result: string;
  confidence: number | null;
};

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  messages: Message[];
  aiAnalyses: AIAnalysis[];
};

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [aiLoading, setAiLoading] = useState("");
  const [error, setError] = useState("");

  const handleUnauthorized = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const loadTicket = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 5000);

      const response = await fetch(
        `http://127.0.0.1:4000/tickets/${id}`,
        {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      clearTimeout(timeout);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Ticket data:", data);

      setTicket({
        id: data?.id ?? 0,
        title: data?.title ?? "",
        description: data?.description ?? "",
        status: data?.status ?? "OPEN",
        priority: data?.priority ?? "MEDIUM",

        messages: Array.isArray(data?.messages)
          ? data.messages
          : [],

        aiAnalyses: Array.isArray(data?.aiAnalyses)
          ? data.aiAnalyses
          : [],
      });
    } catch (err) {
      console.error("Failed to load ticket:", err);

      setError(
        "Unable to load this ticket. Please check whether the backend is running."
      );

      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const runAI = async (action: string) => {
  if (!id) return;

  const token = localStorage.getItem("access_token");

  if (!token) {
    localStorage.removeItem("user");
    router.push("/login");
    return;
  }

  setAiLoading(action);

  // Hide the old AI response while generating a new one
  if (action === "respond") {
    setTicket((currentTicket) => {
      if (!currentTicket) return currentTicket;

      return {
        ...currentTicket,
        aiAnalyses: currentTicket.aiAnalyses.filter(
          (item) => item.type !== "RESPONSE"
        ),
      };
    });
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:4000/tickets/${id}/${action}`,
      {
        method: "POST",
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
      throw new Error(`AI ${action} failed`);
    }

    await loadTicket();
  } catch (error) {
    console.error(`AI ${action} failed:`, error);
  } finally {
    setAiLoading("");
  }
};

  const sendMessage = async () => {
    if (!message.trim() || !id) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:4000/tickets/${id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: message.trim(),
            userId: 1,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setMessage("");

      await loadTicket();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF9] p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DCEFE4] border-t-[#168A5B]" />

              <p className="mt-4 text-sm font-medium text-[#66736C]">
                Loading ticket...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ================= ERROR ================= */

  if (!ticket) {
    return (
      <main className="min-h-screen bg-[#F8FAF9] p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-[#E1EAE5]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
              !
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Ticket could not be loaded
            </h2>

            <p className="mt-2 text-sm text-[#66736C]">
              {error || "Ticket not found."}
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-6 inline-flex rounded-xl bg-[#168A5B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#11764D]"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ================= SAFE ARRAYS ================= */

  const messages = Array.isArray(ticket.messages)
    ? ticket.messages
    : [];

  const aiAnalyses = Array.isArray(ticket.aiAnalyses)
    ? ticket.aiAnalyses
    : [];

  /* ================= AI RESULTS ================= */

  const classification = aiAnalyses.find(
    (item) => item.type === "CLASSIFICATION"
  );

  const sentiment = aiAnalyses.find(
    (item) => item.type === "SENTIMENT"
  );

  const summary = aiAnalyses.find(
    (item) => item.type === "SUMMARY"
  );

  const generatedResponse = [...aiAnalyses]
  .filter((item) => item.type === "RESPONSE")
  .sort((a, b) => b.id - a.id)[0];

  return (
    <main className="min-h-screen bg-[#F8FAF9] text-[#17221D]">
      {/* ================= NAVBAR ================= */}

      <header className="border-b border-[#E1EAE5] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#168A5B] text-xl font-bold text-white">
              ✦
            </div>

            <div>
              <h1 className="text-xl font-bold">
                Support<span className="text-[#168A5B]">AI</span>
              </h1>

              <p className="text-xs text-[#7A8780]">
                Intelligent Support Platform
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="/"
              className="text-[#66736C] transition hover:text-[#168A5B]"
            >
              Dashboard
            </a>

            <span className="font-semibold text-[#168A5B]">
              Ticket Details
            </span>
          </nav>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F7EF] font-semibold text-[#168A5B]">
            A
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* ================= BACK ================= */}

        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#168A5B] transition hover:gap-3"
        >
          ← Back to Dashboard
        </button>

        {/* ================= TICKET HEADER ================= */}

        <section className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#E1EAE5]">
          <div className="p-7 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E8F7EF] font-bold text-[#168A5B]">
                  #{ticket.id}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#168A5B]">
                    Customer Support Ticket
                  </p>

                  <h2 className="mt-1 text-2xl font-bold md:text-3xl">
                    {ticket.title}
                  </h2>

                  <p className="mt-3 max-w-2xl leading-7 text-[#66736C]">
                    {ticket.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#E8F7EF] px-4 py-2 text-xs font-semibold text-[#168A5B]">
                  ● {ticket.status}
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    ticket.priority === "CRITICAL"
                      ? "bg-red-50 text-red-600"
                      : ticket.priority === "HIGH"
                        ? "bg-orange-50 text-orange-600"
                        : ticket.priority === "MEDIUM"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ticket.priority} Priority
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= AI ANALYSIS ================= */}

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-semibold tracking-wider text-[#168A5B]">
              INTELLIGENCE
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              AI Analysis
            </h2>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => runAI("classify")}
                disabled={!!aiLoading}
                className="rounded-xl bg-[#168A5B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#11764D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiLoading === "classify"
                  ? "Classifying..."
                  : "Classify"}
              </button>

              <button
                onClick={() => runAI("sentiment")}
                disabled={!!aiLoading}
                className="rounded-xl bg-[#168A5B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#11764D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiLoading === "sentiment"
                  ? "Analyzing..."
                  : "Analyze Sentiment"}
              </button>

              <button
                onClick={() => runAI("summarize")}
                disabled={!!aiLoading}
                className="rounded-xl bg-[#168A5B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#11764D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiLoading === "summarize"
                  ? "Summarizing..."
                  : "Summarize"}
              </button>

              <button
                onClick={() => runAI("respond")}
                disabled={!!aiLoading}
                className="rounded-xl bg-[#168A5B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#11764D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiLoading === "respond"
                  ? "Generating..."
                  : "Generate Response"}
              </button>
            </div>

            <p className="mt-3 text-sm text-[#66736C]">
              Automated insights generated from this support ticket.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Classification */}

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E1EAE5] transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F7EF] text-lg text-[#168A5B]">
                  ◈
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9AA69F]">
                    Classification
                  </p>

                  <h3 className="font-bold">
                    Ticket Category
                  </h3>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-[#F4FAF6] p-4">
                <p className="font-semibold text-[#168A5B]">
                  {classification?.result ?? "Not analyzed"}
                </p>

                {classification?.confidence !== null &&
                  classification?.confidence !== undefined && (
                    <p className="mt-2 text-xs text-[#66736C]">
                      Confidence:{" "}
                      {(classification.confidence * 100).toFixed(0)}%
                    </p>
                  )}
              </div>
            </div>

            {/* Sentiment */}

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E1EAE5] transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF4E8] text-lg text-orange-500">
                  ☺
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9AA69F]">
                    Sentiment
                  </p>

                  <h3 className="font-bold">
                    Customer Emotion
                  </h3>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-[#FFF9F3] p-4">
                <p className="font-semibold text-orange-500">
                  {sentiment?.result ?? "Not analyzed"}
                </p>

                {sentiment?.confidence !== null &&
                  sentiment?.confidence !== undefined && (
                    <p className="mt-2 text-xs text-[#66736C]">
                      Confidence:{" "}
                      {(sentiment.confidence * 100).toFixed(0)}%
                    </p>
                  )}
              </div>
            </div>

            {/* Summary */}

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E1EAE5] transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF6FF] text-lg text-blue-500">
                  ≡
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9AA69F]">
                    Summary
                  </p>

                  <h3 className="font-bold">
                    AI Issue Summary
                  </h3>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-[#F6FAFF] p-4">
                <p className="text-sm leading-6 text-[#66736C]">
                  {summary?.result ?? "No summary available."}
                </p>
              </div>
            </div>

            {/* Response */}

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E1EAE5] transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F7EF] text-lg text-[#168A5B]">
                  ✦
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9AA69F]">
                    AI Response
                  </p>

                  <h3 className="font-bold">
                    Suggested Support Reply
                  </h3>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-[#F4FAF6] p-4">
                <p className="text-sm leading-6 text-[#66736C]">
                  {generatedResponse?.result ??
                    "No AI response available."}
                </p>

                {generatedResponse?.confidence !== null &&
                  generatedResponse?.confidence !== undefined && (
                    <p className="mt-3 text-xs text-[#168A5B]">
                      Confidence:{" "}
                      {(generatedResponse.confidence * 100).toFixed(0)}%
                    </p>
                  )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= MESSAGES ================= */}

        <section className="mt-9 mb-8">
          <div className="mb-5">
            <p className="text-xs font-semibold tracking-wider text-[#168A5B]">
              CONVERSATION
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Messages
            </h2>

            <p className="mt-1 text-sm text-[#66736C]">
              Customer and support conversation history.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E1EAE5]">
            {messages.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F7EF] text-xl text-[#168A5B]">
                  💬
                </div>

                <p className="mt-4 font-medium text-gray-700">
                  No messages yet
                </p>

                <p className="mt-1 text-sm text-[#66736C]">
                  Start the conversation below.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F7EF] text-sm font-semibold text-[#168A5B]">
                      {msg.userId === 1 ? "A" : "U"}
                    </div>

                    <div className="flex-1 rounded-2xl bg-[#F6F8F7] p-4">
                      <p className="text-sm leading-6 text-[#3F4B44]">
                        {msg.content}
                      </p>

                      <p className="mt-2 text-xs text-[#9AA69F]">
                        User #{msg.userId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Send Message */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Write a message to the customer..."
                className="flex-1 rounded-xl border border-[#DDE7E1] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#A2ADA7] focus:border-[#168A5B] focus:ring-2 focus:ring-[#168A5B]/10"
              />

              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="rounded-xl bg-[#168A5B] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#11764D] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send Message →
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}