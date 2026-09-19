"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Chunk = {
  id: number;
  content: string;
  chunkIndex: number;
};

type Document = {
  id: number;
  title: string;
  content: string;
  source?: string | null;
  chunks: Chunk[];
};

type SearchResult = {
  id: number;
  content: string;
  chunkIndex: number;
  documentId: number;
  documentTitle: string;
  similarity: number;
};

type StoredUser = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

export default function KnowledgePage() {
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState<StoredUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // ================= USER =================

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      window.location.replace("/login");
      return;
    }

    try {
      const parsedUser: StoredUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Failed to read user information:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("access_token");

      window.location.replace("/login");
    }
  }, []);

  const userName = user?.name || "User";
  const userEmail = user?.email || "No email available";
  const userRole = user?.role || "USER";

  const userInitial =
    userName.trim().charAt(0).toUpperCase() || "U";

  const formattedRole =
    userRole.charAt(0) +
    userRole.slice(1).toLowerCase();

  const canManageKnowledge =
    userRole === "ADMIN" || userRole === "AGENT";

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setProfileOpen(false);

    // Immediately redirect without needing refresh
    window.location.replace("/login");
  };

  // ================= AUTH =================

  const handleUnauthorized = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    window.location.replace("/login");
  };

  // ================= LOAD DOCUMENTS =================

  const loadDocuments = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:4000/knowledge/documents",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to view knowledge documents."
        );
      }

      if (!response.ok) {
        throw new Error("Failed to load documents");
      }

      const data = await response.json();

      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load documents:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load knowledge documents."
      );
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // ================= CREATE DOCUMENT =================

  const createDocument = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
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
      const response = await fetch(
        "http://127.0.0.1:4000/knowledge/documents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            source: source.trim() || undefined,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "Only Admin and Agent users can add knowledge documents."
        );
      }

      if (!response.ok) {
        throw new Error("Failed to create document");
      }

      setTitle("");
      setContent("");
      setSource("");

      await loadDocuments();
    } catch (error) {
      console.error("Failed to create document:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create document."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH KNOWLEDGE =================

  const searchKnowledge = async () => {
    if (!query.trim()) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setSearching(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:4000/knowledge/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: query.trim(),
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to search the knowledge base."
        );
      }

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Knowledge search failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to search knowledge base."
      );
    } finally {
      setSearching(false);
    }
  };

  // ================= STATS =================

  const totalChunks = useMemo(() => {
    return documents.reduce(
      (total, document) =>
        total + (document.chunks?.length ?? 0),
      0
    );
  }, [documents]);

  const documentsWithChunks = documents.filter(
    (document) => (document.chunks?.length ?? 0) > 0
  ).length;

  // ================= DOCUMENT UI =================

  const getDocumentIcon = (index: number) => {
    const icons = ["📘", "📗", "📙", "📕", "📓"];

    return icons[index % icons.length];
  };

  const getDocumentStyle = (index: number) => {
    const styles = [
      "from-emerald-50 to-teal-50 border-emerald-100",
      "from-blue-50 to-cyan-50 border-blue-100",
      "from-violet-50 to-purple-50 border-violet-100",
      "from-orange-50 to-amber-50 border-orange-100",
      "from-rose-50 to-pink-50 border-rose-100",
    ];

    return styles[index % styles.length];
  };

  const getScoreStyle = (score: number) => {
    if (score >= 0.7) {
      return "bg-emerald-100 text-emerald-700";
    }

    if (score >= 0.5) {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-blue-50 text-slate-900">

      {/* ================= NAVBAR ================= */}

      <header className="relative z-[100] border-b border-white/70 bg-white/80 shadow-sm backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          {/* Logo */}

          <button
            onClick={() => router.push("/")}
            className="text-xl font-extrabold tracking-tight"
          >
            Support
            <span className="text-emerald-600">AI</span>
          </button>

          {/* Navigation */}

          <nav className="hidden items-center gap-8 md:flex">

            <button
              onClick={() => router.push("/")}
              className="text-sm font-semibold text-slate-400 transition hover:text-emerald-600"
            >
              Dashboard
            </button>

            <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              Knowledge Base
            </span>

          </nav>

          {/* ================= USER PROFILE ================= */}

          <div className="relative z-[110]">

            <button
              onClick={() =>
                setProfileOpen((previous) => !previous)
              }
              aria-label="Open user profile"
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-sm font-extrabold text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                profileOpen
                  ? "ring-2 ring-emerald-200"
                  : ""
              }`}
            >
              {userInitial}
            </button>

            {/* Profile Dropdown */}

            {profileOpen && (
              <div className="absolute right-0 top-12 z-[120] w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">

                {/* User Information */}

                <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white shadow-md">
                      {userInitial}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-extrabold text-slate-900">
                        {userName}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-slate-500">
                        {userEmail}
                      </p>

                    </div>

                  </div>

                </div>

                {/* Account Information */}

                <div className="p-3">

                  <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2.5">

                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Role
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-700">
                      {formattedRole}
                    </p>

                  </div>

                  {/* Logout */}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-red-600 transition hover:bg-red-50"
                  >

                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                      ↪
                    </span>

                    Logout

                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </header>

      {/* ================= MAIN CONTENT ================= */}

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">

        {/* ================= PAGE HEADER ================= */}

        <section className="relative z-0 mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-7 text-white shadow-xl shadow-emerald-200/60">

          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative">

            <button
              onClick={() => router.push("/")}
              className="mb-5 text-sm font-medium text-emerald-100 transition hover:text-white"
            >
              ← Back to Dashboard
            </button>

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                    ✦
                  </span>

                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
                    Intelligent Knowledge
                  </span>

                </div>

                <h1 className="text-4xl font-extrabold tracking-tight">
                  Knowledge Base
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">
                  Store support documentation and retrieve relevant
                  information using AI-powered semantic search.
                </p>

              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-md">

                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                  RAG Knowledge
                </p>

                <p className="mt-1 text-2xl font-extrabold">
                  {totalChunks}
                </p>

                <p className="text-xs text-emerald-100">
                  searchable chunks
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-5 py-4 shadow-sm">

            <div className="flex items-center gap-3">

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100">
                ⚠️
              </span>

              <p className="text-sm font-semibold text-red-700">
                {error}
              </p>

            </div>

            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>

          </div>
        )}

        {/* ================= STATS ================= */}

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Documents */}

          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-100">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Documents
                </p>

                <p className="mt-2 text-3xl font-extrabold">
                  {documents.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Knowledge sources
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-xl text-white shadow-lg shadow-emerald-200">
                📚
              </div>

            </div>

          </div>

          {/* Chunks */}

          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Knowledge Chunks
                </p>

                <p className="mt-2 text-3xl font-extrabold">
                  {totalChunks}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  AI searchable units
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-xl text-white shadow-lg shadow-blue-200">
                🧩
              </div>

            </div>

          </div>

          {/* Indexed */}

          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  Indexed
                </p>

                <p className="mt-2 text-3xl font-extrabold">
                  {documentsWithChunks}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Documents ready for RAG
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-xl text-white shadow-lg shadow-violet-200">
                ✨
              </div>

            </div>

          </div>

        </section>

        {/* ================= MAIN GRID ================= */}

        <div
          className={
            canManageKnowledge
              ? "grid gap-7 lg:grid-cols-3"
              : "grid gap-7"
          }
        >

          {/* ================= ADD DOCUMENT ================= */}

          {canManageKnowledge && (
            <section className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-lg shadow-slate-200/50 backdrop-blur lg:col-span-1">

              <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white shadow-lg shadow-emerald-200">
                    +
                  </div>

                  <div>

                    <h2 className="text-xl font-extrabold text-slate-900">
                      Add Document
                    </h2>

                    <p className="text-xs text-slate-500">
                      Expand your AI knowledge base
                    </p>

                  </div>

                </div>

              </div>

              <form
                onSubmit={createDocument}
                className="space-y-5 p-6"
              >

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Document Title
                  </label>

                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Password Reset Guide"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Content
                  </label>

                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your support documentation..."
                    rows={9}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />

                  <p className="mt-1.5 text-right text-[10px] text-slate-400">
                    {content.length} characters
                  </p>

                </div>

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Source
                  </label>

                  <input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Internal Support Guide"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>+</span>
                      Add Document
                    </>
                  )}

                </button>

              </form>

            </section>
          )}

          {/* ================= DOCUMENTS ================= */}

          <section
            className={
              canManageKnowledge
                ? "rounded-3xl border border-white bg-white/90 p-6 shadow-lg shadow-slate-200/50 backdrop-blur lg:col-span-2"
                : "rounded-3xl border border-white bg-white/90 p-6 shadow-lg shadow-slate-200/50 backdrop-blur"
            }
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Knowledge Library
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Documents
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {documents.length} document
                  {documents.length !== 1 ? "s" : ""} available
                </p>

              </div>

              <div className="hidden rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:block">
                {totalChunks} chunks
              </div>

            </div>

            <div className="mt-6 space-y-3">

              {documents.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 text-2xl">
                    📚
                  </div>

                  <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                    No documents yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {canManageKnowledge
                      ? "Add your first support document to build the AI knowledge base."
                      : "No knowledge documents are currently available."}
                  </p>

                </div>

              ) : (

                documents.map((doc, index) => (

                  <div
                    key={doc.id}
                    className={`group rounded-2xl border bg-gradient-to-r p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${getDocumentStyle(
                      index
                    )}`}
                  >

                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                        {getDocumentIcon(index)}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-start justify-between gap-3">

                          <div>

                            <h3 className="text-base font-extrabold text-slate-900">
                              {doc.title}
                            </h3>

                            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600">
                              {doc.content}
                            </p>

                          </div>

                          <span className="shrink-0 rounded-full border border-white bg-white/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 shadow-sm">
                            {doc.chunks?.length ?? 0} chunks
                          </span>

                        </div>

                        <div className="mt-3 flex items-center gap-3">

                          {doc.source && (
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                              <span>◈</span>
                              {doc.source}
                            </span>
                          )}

                          {(doc.chunks?.length ?? 0) > 0 && (
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Indexed
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                ))
              )}

            </div>

          </section>

        </div>

        {/* ================= SEARCH ================= */}

        <section className="relative mt-7 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-7 text-white shadow-xl">

          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-xl shadow-lg shadow-emerald-950/40">
                  🔍
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                    AI Retrieval
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold">
                    Search Knowledge
                  </h2>

                  <p className="mt-1 text-sm text-slate-300">
                    Find relevant support information using semantic search.
                  </p>

                </div>

              </div>

              <div className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-emerald-200 backdrop-blur">
                Sentence Transformers + pgvector
              </div>

            </div>

            {/* Search Input */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <div className="relative flex-1">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ✦
                </span>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchKnowledge();
                    }
                  }}
                  placeholder="Ask something like: How can I reset my password?"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-11 py-3.5 text-sm text-white outline-none backdrop-blur placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white/15 focus:ring-4 focus:ring-emerald-500/10"
                />

              </div>

              <button
                onClick={searchKnowledge}
                disabled={searching || !query.trim()}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/30 transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {searching
                  ? "Searching..."
                  : "Search Knowledge"}
              </button>

            </div>

            {/* Search Results */}

            {results.length > 0 && (

              <div className="mt-6 space-y-3">

                <div className="flex items-center justify-between">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Relevant Results
                  </p>

                  <span className="text-xs text-slate-500">
                    {results.length} matches
                  </span>

                </div>

                {results.map((result) => (

                  <div
                    key={result.id}
                    className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur transition hover:bg-white/15"
                  >

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <div className="flex gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                          ✦
                        </div>

                        <div>

                          <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">
                            {result.documentTitle}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-200">
                            {result.content}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold ${getScoreStyle(
                          result.similarity
                        )}`}
                      >
                        {(result.similarity * 100).toFixed(1)}% match
                      </span>

                    </div>

                  </div>

                ))}

              </div>
            )}

            {query && !searching && results.length === 0 && (

              <div className="mt-5 rounded-xl bg-white/5 px-5 py-4 text-sm text-slate-400">
                No relevant knowledge found. Try using different keywords or a
                more detailed question.
              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}