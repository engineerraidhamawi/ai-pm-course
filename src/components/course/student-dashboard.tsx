"use client";

import { Module } from "@/lib/course-data";
import { Student, ProgressStatus } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, PlayCircle, Trophy, ArrowRight, Star } from "lucide-react";
import { ShareButtons } from "./share-buttons";

type Props = {
  student: Student;
  modules: Module[];
  progress: Record<string, { status: ProgressStatus; percent: number }>;
  onBack: () => void;
  onNavigate: (moduleId: string) => void;
  onViewCertificate: () => void;
};

export function StudentDashboard({ student, modules, progress, onBack, onNavigate, onViewCertificate }: Props) {
  const totalModules = modules.length;
  const completedCount = Object.values(progress).filter((p) => p.status === "completed").length;
  const inProgressCount = Object.values(progress).filter((p) => p.status === "in_progress").length;
  const overallPct = Math.round((completedCount / totalModules) * 100);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowRight className="h-4 w-4 rotate-180" />
        Back to course
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Progress</h1>
            <p className="mt-1 text-sm text-slate-500">Welcome back, {student.name}!</p>
          </div>
          {overallPct === 100 && (
            <Button onClick={onViewCertificate} className="bg-amber-500 text-white hover:bg-amber-600">
              <Trophy className="mr-1.5 h-4 w-4" />
              View Certificate
            </Button>
          )}
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-500">Overall Completion</span>
            <span className="font-bold text-slate-700">{completedCount}/{totalModules} · {overallPct}%</span>
          </div>
          <Progress value={overallPct} className="h-3" />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-emerald-50 p-3">
            <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
            <div className="text-xs text-slate-500">Completed</div>
          </div>
          <div className="rounded-xl bg-indigo-50 p-3">
            <div className="text-2xl font-bold text-indigo-600">{inProgressCount}</div>
            <div className="text-xs text-slate-500">In Progress</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-2xl font-bold text-slate-600">{totalModules - completedCount - inProgressCount}</div>
            <div className="text-xs text-slate-500">Not Started</div>
          </div>
        </div>
      </div>

      {/* Module Breakdown */}
      <div className="mt-6 space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Module Breakdown</h2>
        {modules.map((m) => {
          const p = progress[m.id];
          const status: ProgressStatus = p?.status ?? "not_started";
          const pct = status === "completed" ? 100 : (p?.percent ?? 0);
          return (
            <button
              key={m.id}
              onClick={() => onNavigate(m.id)}
              className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <div className={
                "grid h-10 w-10 flex-none place-items-center rounded-xl text-sm font-bold shadow-sm transition " +
                (status === "completed" ? "bg-emerald-500 text-white"
                  : status === "in_progress" ? "bg-indigo-500 text-white"
                  : "bg-slate-100 text-slate-500")
              }>
                {status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : m.number}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-600">{m.title}</h4>
                  <span className="ml-2 flex-none text-xs text-slate-400">
                    {status === "completed" ? "Completed" : status === "in_progress" ? "In Progress" : "Not Started"}
                  </span>
                </div>
                <Progress value={pct} className="mt-2 h-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Social Sharing */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Share your progress</h3>
        <ShareButtons 
          title={`I've completed ${overallPct}% of the AI-Powered Project Management course!`} 
          url={typeof window !== "undefined" ? window.location.href : ""}
        />
      </div>
    </div>
  );
}