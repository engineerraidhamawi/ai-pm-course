"use client";

import { useMemo } from "react";
import { Module } from "@/lib/course-data";
import { Student } from "@/lib/session";
import { Trophy, Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  student: Student;
  modules: Module[];
  completedCount: number;
  onPrint: () => void;
};

export function Certificate({ student, modules, completedCount, onPrint }: Props) {
  const completionDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const certificateId = useMemo(() => {
    // Generate a unique certificate ID based on student ID and date
    const hash = student.id.slice(-8).toUpperCase();
    return `AIPM-${hash}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
  }, [student.id]);

  if (completedCount < modules.length) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-6 sm:px-6">
      <div className="mb-4 text-center">
        <Button onClick={onPrint} className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Download className="mr-1.5 h-4 w-4" />
          Download Certificate (PDF)
        </Button>
      </div>

      {/* Certificate */}
      <div
        id="certificate-paper"
        className="relative overflow-hidden rounded-2xl border-4 border-double border-amber-500 bg-white p-8 shadow-xl sm:p-12"
        style={{ aspectRatio: "1.414 / 1" }}
      >
        {/* Decorative corners */}
        <div className="absolute left-4 top-4 h-12 w-12 border-l-4 border-t-4 border-amber-400" />
        <div className="absolute right-4 top-4 h-12 w-12 border-r-4 border-t-4 border-amber-400" />
        <div className="absolute bottom-4 left-4 h-12 w-12 border-b-4 border-l-4 border-amber-400" />
        <div className="absolute bottom-4 right-4 h-12 w-12 border-b-4 border-r-4 border-amber-400" />

        {/* Watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
          <Trophy className="h-64 w-64" />
        </div>

        <div className="relative flex h-full flex-col items-center justify-between text-center">
          {/* Header */}
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700">
              <Award className="h-3 w-3" />
              Certificate of Completion
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              AI-Powered Project Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">Complete Course Curriculum</p>
          </div>

          {/* Body */}
          <div className="my-6">
            <p className="text-sm uppercase tracking-widest text-slate-500">This certifies that</p>
            <h2 className="mt-2 text-3xl font-bold italic text-indigo-700 sm:text-4xl" style={{ fontFamily: "Georgia, serif" }}>
              {student.name}
            </h2>
            <p className="mt-3 max-w-md text-sm text-slate-600">
              has successfully completed all {modules.length} modules of the AI-Powered Project Management course,
              demonstrating proficiency in using AI tools for project planning, documentation, communication, and reporting.
            </p>
          </div>

          {/* Footer */}
          <div className="w-full">
            <div className="mx-auto mb-4 h-px w-2/3 bg-slate-300" />
            <div className="flex items-end justify-between px-4 text-xs">
              <div className="text-left">
                <p className="font-semibold text-slate-900">{completionDate}</p>
                <p className="text-slate-500">Date of Completion</p>
              </div>
              <div className="text-center">
                <Trophy className="mx-auto mb-1 h-8 w-8 text-amber-500" />
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Course Instructor</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{certificateId}</p>
                <p className="text-slate-500">Certificate ID</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}