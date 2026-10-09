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

export async function fetchDashboard(): Promise<DashboardStudent[]> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  const data = await res.json();
  return data.students as DashboardStudent[];
}