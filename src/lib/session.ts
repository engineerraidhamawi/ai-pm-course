"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type ProgressMap = Record<
  string,
  { status: ProgressStatus; percent: number; lastVisited: string; completedAt?: string | null }
>;

export type Student = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type SessionState = {
  student: Student | null;
  progress: ProgressMap;
  setStudent: (s: Student | null) => void;
  setProgress: (p: ProgressMap) => void;
  upsertProgress: (
    moduleId: string,
    patch: { status: ProgressStatus; percent?: number; completedAt?: string | null },
  ) => void;
  clear: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      student: null,
      progress: {},
      setStudent: (s) => set({ student: s }),
      setProgress: (p) => set({ progress: p }),
      upsertProgress: (moduleId, patch) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [moduleId]: {
              status: patch.status,
              percent: patch.percent ?? state.progress[moduleId]?.percent ?? 0,
              lastVisited: new Date().toISOString(),
              completedAt: patch.completedAt ?? state.progress[moduleId]?.completedAt ?? null,
            },
          },
        })),
      clear: () => set({ student: null, progress: {} }),
    }),
    {
      name: "ai-pm-course-session",
      skipHydration: true,
    },
  ),
);

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useSession.persist.rehydrate();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);
  return hydrated;
}

export async function registerStudent(name: string, email: string) {
  const res = await fetch("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to register");
  }
  const data = await res.json();
  return data.student as Student;
}

export async function fetchStudentProgress(studentId: string) {
  const res = await fetch(`/api/progress?studentId=${encodeURIComponent(studentId)}`);
  if (!res.ok) return {};
  const data = await res.json();
  const map: ProgressMap = {};
  for (const row of data.progress ?? []) {
    map[row.moduleId] = {
      status: row.status,
      percent: row.percent ?? 0,
      lastVisited: row.lastVisited,
      completedAt: row.completedAt,
    };
  }
  return map;
}

export async function updateProgress(
  studentId: string,
  moduleId: string,
  status: ProgressStatus,
  percent?: number,
) {
  await fetch("/api/progress", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, moduleId, status, percent }),
  });
}

export type DashboardStudent = Student & {
  progress: {
    moduleId: string;
    status: ProgressStatus;
    percent: number;
    lastVisited: string;
    completedAt: string | null;
  }[];
};

export type DashboardStudent = Student & {
  progress: {
    moduleId: string;
    status: ProgressStatus;
    percent: number;
    lastVisited: string;
    completedAt: string | null;
  }[];
};

export async function fetchDashboard(instructorKey?: string): Promise<DashboardStudent[]> {
  const headers: Record<string, string> = {};
  if (instructorKey) {
    headers["Authorization"] = `Bearer ${instructorKey}`;
  }
  const res = await fetch("/api/dashboard", { headers });
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  const data = await res.json();
  return data.students as DashboardStudent[];
}
export async function updateLastVisitedModule(studentId: string, moduleId: string) {
  try {
    await fetch("/api/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, lastVisitedModule: moduleId }),
    });
  } catch {
    // silent — don't break the UX if this fails
  }
}

// Bulk add students — returns {added, updated, failed, errors}
export async function bulkAddStudents(students: Array<{ name: string; email: string }>, instructorKey?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (instructorKey) headers["Authorization"] = `Bearer ${instructorKey}`;
  const res = await fetch("/api/students", {
    method: "PUT",
    headers,
    body: JSON.stringify({ students }),
  });
  if (!res.ok) throw new Error("Failed to bulk add students");
  const data = await res.json();
  return data.results as { added: number; updated: number; failed: number; errors: string[] };
}

// Delete a single student
export async function deleteStudent(studentId: string, instructorKey?: string) {
  const headers: Record<string, string> = {};
  if (instructorKey) headers["Authorization"] = `Bearer ${instructorKey}`;
  const res = await fetch(`/api/students?studentId=${encodeURIComponent(studentId)}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete student");
  return res.json();
}

// Bulk delete students
export async function bulkDeleteStudents(studentIds: string[], instructorKey?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (instructorKey) headers["Authorization"] = `Bearer ${instructorKey}`;
  const res = await fetch("/api/students", {
    method: "DELETE",
    headers,
    body: JSON.stringify({ studentIds }),
  });
  if (!res.ok) throw new Error("Failed to bulk delete students");
  return res.json();
}