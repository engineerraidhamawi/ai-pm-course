"use client";

import { useEffect, useRef, useState } from "react";
import { fetchDashboard, bulkAddStudents, deleteStudent, bulkDeleteStudents, DashboardStudent } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, RefreshCw, Search, Download, Upload, Trash2, Trophy, Lock, X, CheckCircle2, AlertCircle } from "lucide-react";
import { MODULES } from "@/lib/course-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type Props = { onBack: () => void };

export function InstructorDashboard({ onBack }: Props) {
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [students, setStudents] = useState<DashboardStudent[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkAddText, setBulkAddText] = useState("");
  const [bulkAddResult, setBulkAddResult] = useState<{ added: number; updated: number; failed: number; errors: string[] } | null>(null);
  const [bulkAddLoading, setBulkAddLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  function showToast(msg: string, type: "success" | "error" | "info" = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    const savedKey = sessionStorage.getItem("instructor-key");
    if (savedKey) {
      setKeyInput(savedKey);
      loadStudents(savedKey);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadStudents(key?: string) {
    setLoading(true);
    setError(null);
    setAuthError(null);
    try {
      const k = key || keyInput;
      const data = await fetchDashboard(k);
      setStudents(data);
      setAuthed(true);
      sessionStorage.setItem("instructor-key", k);
      
      // Fetch feedback data
      const feedbackRes = await fetch("/api/feedback");
      const feedbackJson = await feedbackRes.json();
      setFeedbackData(feedbackJson.feedback || []);
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
    setSelectedIds(new Set());
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkAddText(text);
    };
    reader.readAsText(file);
  }

  function parseStudentsFromText(text: string): Array<{ name: string; email: string }> {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const students: Array<{ name: string; email: string }> = [];
    for (const line of lines) {
      const parts = line.split(/[,\t]/).map((p) => p.trim().replace(/^"|"$/g, ""));
      if (parts.length >= 2) {
        const emailPart = parts.find((p) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p));
        const namePart = parts.find((p) => p !== emailPart);
        if (emailPart && namePart) {
          students.push({ name: namePart, email: emailPart.toLowerCase() });
        }
      } else if (parts.length === 1) {
        const email = parts[0];
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          students.push({ name, email: email.toLowerCase() });
        }
      }
    }
    return students;
  }

  async function handleBulkAdd() {
    const parsed = parseStudentsFromText(bulkAddText);
    if (parsed.length === 0) {
      showToast("No valid students found. Use format: Name,Email (one per line)", "error");
      return;
    }
    setBulkAddLoading(true);
    try {
      const result = await bulkAddStudents(parsed, keyInput);
      setBulkAddResult(result);
      showToast(`Added ${result.added}, updated ${result.updated}, failed ${result.failed}`, "success");
      await loadStudents();
    } catch (e) {
      showToast("Failed to add students", "error");
    } finally {
      setBulkAddLoading(false);
    }
  }

  async function handleDeleteSingle(studentId: string, studentName: string) {
    if (!confirm(`Delete ${studentName}? This will remove all their progress.`)) return;
    try {
      await deleteStudent(studentId, keyInput);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      showToast(`Deleted ${studentName}`, "success");
    } catch (e) {
      showToast("Failed to delete student", "error");
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) {
      showToast("Select students to delete first", "error");
      return;
    }
    if (!confirm(`Delete ${selectedIds.size} student(s)? This will remove all their progress.`)) return;
    try {
      await bulkDeleteStudents(Array.from(selectedIds), keyInput);
      setStudents((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      showToast(`Deleted ${selectedIds.size} student(s)`, "success");
      setSelectedIds(new Set());
    } catch (e) {
      showToast("Failed to delete students", "error");
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  }

  const totalModules = MODULES.length;

  const stats = (() => {
    let totalCompletions = 0;
    let startedCount = 0;
    let completedCount = 0;
    let notStartedCount = 0;

    for (const s of students) {
      const completed = s.progress.filter((p) => p.status === "completed").length;
      const inProgress = s.progress.filter((p) => p.status === "in_progress").length;
      
      totalCompletions += completed;
      
      if (completed === totalModules) completedCount++;
      else if (completed > 0 || inProgress > 0) startedCount++;
      else notStartedCount++;
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
      completedCount,
      startedCount,
      notStartedCount,
    };
  })();

  // Chart data: Module completion counts
  const moduleCompletionData = MODULES.map((m) => {
    const completed = students.filter((s) => s.progress.some((p) => p.moduleId === m.id && p.status === "completed")).length;
    const inProgress = students.filter((s) => s.progress.some((p) => p.moduleId === m.id && p.status === "in_progress")).length;
    return {
      name: `M${m.number}`,
      completed,
      inProgress,
    };
  });

  // Chart data: Student status distribution
  const studentStatusData = [
    { name: "Not Started", value: stats.notStartedCount, color: "#e2e8f0" },
    { name: "In Progress", value: stats.startedCount, color: "#6366f1" },
    { name: "Completed", value: stats.completedCount, color: "#10b981" },
  ];

  // Chart data: Average rating per module
  const ratingData = MODULES.map((m) => {
    const moduleFeedback = feedbackData.filter((f: any) => f.moduleId === m.id);
    const avgRating = moduleFeedback.length > 0
      ? moduleFeedback.reduce((sum: number, f: any) => sum + f.rating, 0) / moduleFeedback.length
      : 0;
    return {
      name: `M${m.number}`,
      rating: parseFloat(avgRating.toFixed(1)),
    };
  }).filter(m => m.rating > 0);

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

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 pb-24 pt-20 sm:px-6">
        <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600">
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
            <p className="mb-4 text-center text-sm text-slate-500">Enter the instructor password to manage students.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="instructor-key">Password</Label>
                <Input id="instructor-key" type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Enter instructor password" autoFocus />
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

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">
      {toast && (
        <div className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-lg px-4 py-3 shadow-lg ${toast.type === "success" ? "bg-emerald-500 text-white" : toast.type === "error" ? "bg-red-500 text-white" : "bg-slate-800 text-white"}`}>
          <div className="flex items-center gap-2">
            {toast.type === "success" && <CheckCircle2 className="h-4 w-4" />}
            {toast.type === "error" && <AlertCircle className="h-4 w-4" />}
            <span className="text-sm font-medium">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600">
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
          <p className="mt-1 text-sm text-slate-500">Add, remove, and track student progress.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setBulkAddOpen(true)}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Bulk Add Students
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkDelete} disabled={selectedIds.size === 0}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete Selected ({selectedIds.size})
          </Button>
          <Button variant="outline" size="sm" onClick={() => loadStudents()} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!students.length}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Certified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Student Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Student Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalStudents === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No students enrolled yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={studentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {studentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Module Completion Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Module Completion</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalStudents === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No data to display yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={moduleCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inProgress" name="In Progress" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Ratings Chart */}
      {ratingData.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Module Average Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="rating" name="Avg Rating" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email…" className="pl-9" />
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading students…</div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              {students.length === 0 ? "No students enrolled yet. Click \"Bulk Add Students\" to upload a CSV!" : "No students match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer rounded border-slate-300" />
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Student</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Joined</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Progress</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Last Active</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">Actions</th>
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
                      <tr key={s.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/40 ${selectedIds.has(s.id) ? "bg-indigo-50/40" : ""}`}>
                        <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} className="h-4 w-4 cursor-pointer rounded border-slate-300" /></td>
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
                              <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100"><Trophy className="h-3 w-3" /> Certified</Badge>
                            ) : completed > 0 ? (
                              <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{completed} done</Badge>
                            ) : inProgress > 0 ? (
                              <Badge variant="secondary">Started</Badge>
                            ) : (
                              <Badge variant="outline">Registered</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteSingle(s.id, s.name)} className="text-slate-400 transition hover:text-red-600" title="Delete student">
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Bulk Add Modal */}
      {bulkAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Bulk Add Students</h2>
              <button onClick={() => { setBulkAddOpen(false); setBulkAddResult(null); }} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <p className="mb-4 text-sm text-slate-600">Upload a CSV file or paste student data below. Format: <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">Name,Email</code> (one per line).</p>
            <div className="mb-4">
              <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Choose CSV File
              </Button>
            </div>
            <div className="mb-4">
              <Label htmlFor="bulk-text">Or paste student data:</Label>
              <textarea id="bulk-text" value={bulkAddText} onChange={(e) => setBulkAddText(e.target.value)} placeholder={`Name,Email\nJane Doe,jane@example.com`} className="mt-1.5 h-48 w-full rounded-md border border-slate-200 p-3 font-mono text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            {bulkAddResult && (
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-2 text-sm font-bold text-slate-900">Results:</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><div className="text-2xl font-bold text-emerald-600">{bulkAddResult.added}</div><div className="text-xs text-slate-500">Added</div></div>
                  <div><div className="text-2xl font-bold text-indigo-600">{bulkAddResult.updated}</div><div className="text-xs text-slate-500">Updated</div></div>
                  <div><div className="text-2xl font-bold text-red-600">{bulkAddResult.failed}</div><div className="text-xs text-slate-500">Failed</div></div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setBulkAddOpen(false); setBulkAddResult(null); setBulkAddText(""); }}>Close</Button>
              <Button onClick={handleBulkAdd} disabled={bulkAddLoading || !bulkAddText.trim()} className="bg-indigo-600 text-white hover:bg-indigo-700">
                {bulkAddLoading ? "Adding…" : "Add Students"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}