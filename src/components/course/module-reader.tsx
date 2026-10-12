"use client";

import { useEffect, useState } from "react";
import { Module } from "@/lib/course-data";
import { ContentRenderer } from "./content-renderer";
import { Quiz } from "./quiz";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft, CheckCircle2, Circle, Clock, ArrowRight, RotateCcw,
  GraduationCap, HelpCircle, Lightbulb, Sparkles, Lock,
} from "lucide-react";
import { useSession, ProgressStatus, updateLastVisitedModule } from "@/lib/session";
import { cn } from "@/lib/utils";

type Props = {
  module: Module;
  nextModule?: Module;
  prevModule?: Module;
  onBack: () => void;
  onNavigate: (moduleId: string) => void;
  onToast: (msg: string, variant?: "default" | "success" | "error") => void;
};

export function ModuleReader({
  module, nextModule, prevModule, onBack, onNavigate, onToast,
}: Props) {
  const { student, progress, upsertProgress } = useSession();
  const current = progress[module.id];
  const status: ProgressStatus = current?.status ?? "not_started";
  const percent = current?.percent ?? 0;
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    if (!student) return;
    // Save last visited module
    updateLastVisitedModule(student.id, module.id);
    // Mark as in_progress if not started
    if (status === "not_started") {
      upsertProgress(module.id, { status: "in_progress", percent: 25 });
      fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, moduleId: module.id, status: "in_progress", percent: 25 }),
      }).catch(() => {});
    }
  }, [module.id, status, student, upsertProgress]);

  async function markComplete() {
    if (!student) return;
    // If there's a quiz, require it to be passed
    if (module.quiz && module.quiz.length > 0 && !quizPassed) {
      onToast("Please pass the quiz first to mark this module complete.", "error");
      return;
    }
    upsertProgress(module.id, { status: "completed", percent: 100, completedAt: new Date().toISOString() });
    try {
      await fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, moduleId: module.id, status: "completed", percent: 100 }),
      });
      onToast(`Module ${module.number} marked as complete! 🎉`, "success");
    } catch {
      onToast("Saved locally — could not sync to server.", "error");
    }
  }

  async function resetModule() {
    if (!student) return;
    upsertProgress(module.id, { status: "not_started", percent: 0, completedAt: null });
    setQuizPassed(false);
    try {
      await fetch(`/api/progress?studentId=${student.id}&moduleId=${module.id}`, { method: "DELETE" });
      onToast(`Module ${module.number} progress reset.`, "default");
    } catch {
      onToast("Could not reset server-side progress.", "error");
    }
  }

  const SKIP_HEADINGS = new Set(["Key Takeaways", "Instructor Note"]);
  const filteredContent: typeof module.content = [];
  let skipMode = false;
    for (const block of module.content) {
    if (block.type === "heading" && SKIP_HEADINGS.has(block.text)) {
      skipMode = true;
      continue;
    }
    if (block.type === "heading" && !SKIP_HEADINGS.has(block.text)) {
      skipMode = false;
    }
    if (!skipMode) filteredContent.push(block);
  }

  const isIntroduction = module.number === 0;
  const isSupplementary = module.supplementary;
  const hasQuiz = module.quiz && module.quiz.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to course
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-lg font-bold text-white shadow">
            {isIntroduction ? "★" : module.number}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
              {isIntroduction ? (
                <Badge variant="outline" className="font-medium">Orientation</Badge>
              ) : (
                <Badge variant="outline" className="font-medium">Part {module.partNumber} · {module.part}</Badge>
              )}
              {module.duration && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {module.duration}
                </Badge>
              )}
              {isSupplementary && (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Supplementary</Badge>
              )}
              {hasQuiz && (
                <Badge variant="outline" className="gap-1 border-sky-200 bg-sky-50 text-sky-700">
                  <HelpCircle className="h-3 w-3" />
                  Quiz required
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
              {module.title}
            </h1>
            {module.summary && module.summary !== module.title && (
              <p className="mt-2 text-sm text-slate-500">{module.summary}</p>
            )}
          </div>
        </div>

        {!isIntroduction && (
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-500">Your progress</span>
              <span className="font-semibold text-slate-700">
                {status === "completed" ? "Completed" : status === "in_progress" ? "In progress" : "Not started"}
                {" · "}
                {status === "completed" ? 100 : percent}%
              </span>
            </div>
            <Progress value={status === "completed" ? 100 : percent} className="h-2" />
          </div>
        )}
      </div>

      {module.outcomes.length > 0 && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <GraduationCap className="h-4 w-4" />
            Learning Outcomes
          </h3>
          <ul className="ml-5 list-disc space-y-1.5 text-[15px] text-slate-700">
            {module.outcomes.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <ContentRenderer blocks={filteredContent} />
      </div>

      {hasQuiz && !isIntroduction && (
        <Quiz
          quiz={module.quiz!}
          onPass={() => setQuizPassed(true)}
        />
      )}

      {module.keyTakeaways.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Lightbulb className="h-4 w-4" />
            Key Takeaways
          </h3>
          <ul className="ml-5 list-disc space-y-1.5 text-[15px] text-slate-700">
            {module.keyTakeaways.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}

      {module.instructorNote && (
        <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
          <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-700">
            <GraduationCap className="h-4 w-4" />
            Instructor Note
          </h3>
          <p className="text-[15px] leading-relaxed text-slate-700">{module.instructorNote}</p>
        </div>
      )}

      {!isIntroduction && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            {status === "completed" ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Module completed</p>
                  <p className="text-xs text-slate-500">
                    {current?.completedAt ? `Marked on ${new Date(current.completedAt).toLocaleDateString()}` : "Great work!"}
                  </p>
                </div>
              </>
            ) : hasQuiz && !quizPassed ? (
              <>
                <Lock className="h-6 w-6 text-slate-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Pass the quiz to complete this module</p>
                  <p className="text-xs text-slate-500">Score 70% or higher to unlock the complete button.</p>
                </div>
              </>
            ) : (
              <>
                <Circle className="h-6 w-6 text-slate-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Ready to complete this module?</p>
                  <p className="text-xs text-slate-500">Click the button once you've finished reading.</p>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {status !== "not_started" && (
              <Button variant="ghost" size="sm" onClick={resetModule} className="text-slate-500 hover:text-slate-700">
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            )}
            {status !== "completed" && (
              <Button
                onClick={markComplete}
                disabled={hasQuiz && !quizPassed}
                className={cn(
                  "text-white",
                  hasQuiz && !quizPassed
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Mark module complete
              </Button>
            )}
          </div>
        </div>
      )}

      {!isIntroduction && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {prevModule ? (
            <button
              onClick={() => onNavigate(prevModule.id)}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow"
            >
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous module
              </div>
              <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                {prevModule.number}. {prevModule.title}
              </div>
            </button>
          ) : <div />}
          {nextModule ? (
            <button
              onClick={() => onNavigate(nextModule.id)}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-right shadow-sm transition hover:border-indigo-300 hover:shadow sm:col-start-2"
            >
              <div className="mb-1 flex items-center justify-end gap-1.5 text-xs font-medium text-slate-400">
                Next module
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
              <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                {nextModule.number}. {nextModule.title}
              </div>
            </button>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center sm:col-start-2">
              <p className="text-sm font-semibold text-emerald-700">🎓 You've reached the final module!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}