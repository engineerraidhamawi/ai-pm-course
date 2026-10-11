"use client";

import { useEffect, useState } from "react";
import { fetchDashboard, DashboardStudent } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, RefreshCw, Search, Download, Trophy, Lock } from "lucide-react";
import { MODULES } from "@/lib/course-data";

type Props = { onBack: () => void };

export function InstructorDashboard({ onBack }: Props) {
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [students, setStudents] = useState<DashboardStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Load saved key from sessionStorage on mount
  useEffect(() => {
    const savedKey = sessionStorage.getItem("instructor-key");
    if (savedKey) {
      setKeyInput(savedKey);
      loadStudents(savedKey);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadStudents(key: string) {
    setLoading(true);
    setError(null);
    setAuthError(null);
    try {
      const data = await fetchDashboard(key);
      setStudents(data);
      setAuthed(true);
      sessionStorage.setItem("instructor-key", key);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      if (msg.includes("Unauthorized") || msg.includes("Failed to fetch dashboard")) {
        setAuthError("Incorrect password. Please try again.");
        setAuthed(false);
        sessionStorage.removeItem("instructor-key");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!keyInput.trim()) return;
    loadStudents(keyInput.trim());
  }

  function handleLogout() {
    sessionStorage.removeItem("instructor-key");
    setAuthed(false);
    setKeyInput("");
    setStudents([]);
  }

  const totalModules = MODULES.length;

  const stats = (() => {
    let totalCompletions = 0;
    for (const s of students) {
      for (const p of s.progress) {
        if (p.status === "completed") totalCompletions++;
      }
    }
    return {
      totalStudents: students.length,
      totalCompletions,
      avgProgress: students.length
        ? Math.round((students.reduce((sum, s) => {
            const completed = s.progress.filter((p) => p.status === "completed").length;
            return sum + (completed / totalModules) * 100;
          }, 0) / students.length))
        : 0,
    };
  })();

  const filtered = students.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  function exportCsv() {
    const rows: string[][] = [["Name", "Email", "Joined", "Modules Completed", "Modules In Progress", "Completion %"]];
    for (const s of students) {
      const completed = s.progress.filter((p) => p.status === "completed").length;
      const inProgress = s.progress.filter((p) => p.status === "in_progress").length;
      const pct = Math.round((completed / totalModules) * 100);
      rows.push([s.name, s.email, new Date(s.createdAt).toLocaleDateString(), String(completed), String(inProgress), `${pct}%`]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `course-progress-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---- Login screen ----
  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 pb-24 pt-20 sm:px-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </button>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow">
              <Lock className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl">Instructor Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-center text-sm text-slate-500">
              Enter the instructor password to view student progress.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="instructor-key">Password</Label>
                <Input
                  id="instructor-key"
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter instructor password"
                  autoFocus
                />
              </div>
              {authError && <p className="text-sm text-red-600">{authError}</p>}
              <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700" disabled={loading}>
                {loading ? "Checking…" : "Unlock Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Dashboard (when authed) ----
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </button>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500">
          <Lock className="mr-1.5 h-3.5 w-3.5" />
          Lock
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Instructor Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Track student progress across the AI-Powered Project Management course.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadStudents(keyInput)} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!students.length}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Modules Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalCompletions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg. Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{stats.avgProgress}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading students…</div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              {students.length === 0
                ? "No students enrolled yet. Share your course link to get started!"
                : "No students match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Student</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Joined</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Progress</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Last Active</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const completed = s.progress.filter((p) => p.status === "completed").length;
                    const inProgress = s.progress.filter((p) => p.status === "in_progress").length;
                    const pct = Math.round((completed / totalModules) * 100);
                    const lastVisits = s.progress.map((p) => p.lastVisited).filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                    const lastActive = lastVisits[0];
                    return (
                      <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{s.name}</div>
                          <div className="text-xs text-slate-500">{s.email}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-1.5 w-24" />
                            <span className="text-xs font-semibold text-slate-700">{completed}/{totalModules}</span>
                            <span className="text-xs text-slate-400">({pct}%)</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{lastActive ? new Date(lastActive).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {pct === 100 ? (
                              <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                                <Trophy className="h-3 w-3" />
                                Certified
                              </Badge>
                            ) : completed > 0 ? (
                              <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{completed} done</Badge>
                            ) : inProgress > 0 ? (
                              <Badge variant="secondary">Started</Badge>
                            ) : (
                              <Badge variant="outline">Registered</Badge>
                            )}
                            {inProgress > 0 && pct < 100 && (
                              <Badge variant="outline" className="text-slate-500">{inProgress} active</Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Module-Level Completion</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Module</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Completed</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">In Progress</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((m) => {
                      const completed = students.filter((s) => s.progress.some((p) => p.moduleId === m.id && p.status === "completed")).length;
                      const inProg = students.filter((s) => s.progress.some((p) => p.moduleId === m.id && p.status === "in_progress")).length;
                      const rate = students.length ? Math.round((completed / students.length) * 100) : 0;
                      return (
                        <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40">
                          <td className="px-4 py-3"><span className="font-medium text-slate-900">{m.number}. {m.title}</span></td>
                          <td className="px-4 py-3 text-slate-600">{completed}</td>
                          <td className="px-4 py-3 text-slate-600">{inProg}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={rate} className="h-1.5 w-24" />
                              <span className="text-xs text-slate-500">{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}