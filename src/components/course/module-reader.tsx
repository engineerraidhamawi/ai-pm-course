"use client";

import { useEffect, useState, useRef } from "react";
import { Module } from "@/lib/course-data";
import { ContentRenderer } from "./content-renderer";
import { Quiz } from "./quiz";
import { ModuleFeedback } from "./module-feedback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft, CheckCircle2, Circle, Clock, ArrowRight, RotateCcw,
  GraduationCap, HelpCircle, Lightbulb, Lock, StickyNote, X, Save,
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

  // Notes state
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load note when module opens
  useEffect(() => {
    if (!student) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/notes?studentId=${student.id}&moduleId=${module.id}`);
        if (!cancelled) {
          const data = await res.json();
          setNoteContent(data.note ?? "");
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [student, module.id]);

  // Auto-save note (debounced)
  useEffect(() => {
    if (!student || !noteContent) return;
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      setNoteSaving(true);
      try {
        await fetch("/api/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            moduleId: module.id,
            content: noteContent,
          }),
        });
        setNoteSaving(false);
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
      } catch {
        setNoteSaving(false);
      }
    }, 1500); // Save 1.5 seconds after user stops typing

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [noteContent, student, module.id]);

  useEffect(() => {
    if (!student) return;
    updateLastVisitedModule(student.id, module.id);
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
      {/* Top bar with back button + notes button */}
      <div className="mb-4 flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to course
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print
          </button>
          {!isIntroduction && (
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition",
                notesOpen
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <StickyNote className="h-3.5 w-3.5" />
              Notes
              {noteContent.trim() && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />}
            </button>
          )}
        </div>
      </div>

      {/* Module header */}
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

      {/* Main content + Notes sidebar layout */}
      <div className="mt-6 flex gap-6">
        {/* Main content */}
        <div className={cn("min-w-0 flex-1", notesOpen && "hidden lg:block")}>
          {module.outcomes.length > 0 && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <GraduationCap className="h-4 w-4" />
                Learning Outcomes
              </h3>
              <ul className="ml-5 list-disc space-y-1.5 text-[15px] text-slate-700">
                {module.outcomes.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
          )}

          <div id="module-content" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <ContentRenderer blocks={filteredContent} />
          </div>

          {hasQuiz && !isIntroduction && (
            <Quiz quiz={module.quiz!} onPass={() => setQuizPassed(true)} />
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
            <div className="no-print mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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

          {/* Module Feedback */}
          {!isIntroduction && (
            <ModuleFeedback moduleId={module.id} onToast={onToast} />
          )}

          {!isIntroduction && (
            <div className="no-print mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        {/* Notes sidebar */}
        {notesOpen && !isIntroduction && (
          <div className="no-print fixed inset-0 z-50 lg:relative lg:z-auto lg:w-80 lg:flex-none">
            {/* Mobile overlay */}
            <div
              className="absolute inset-0 bg-black/30 lg:hidden"
              onClick={() => setNotesOpen(false)}
            />
            {/* Notes panel */}
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] rounded-l-2xl border-l border-slate-200 bg-white shadow-2xl lg:static lg:h-auto lg:rounded-2xl lg:border lg:shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <StickyNote className="h-4 w-4 text-indigo-500" />
                  My Notes
                </h3>
                <div className="flex items-center gap-2">
                  {noteSaving ? (
                    <span className="text-xs text-slate-400">Saving…</span>
                  ) : noteSaved ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <Save className="h-3 w-3" />
                      Saved
                    </span>
                  ) : null}
                  <button
                    onClick={() => setNotesOpen(false)}
                    className="text-slate-400 transition hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="mb-2 text-xs text-slate-500">
                  Module {module.number}: {module.title}
                </p>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your notes here… They auto-save as you type and are private to you."
                  className="h-[calc(100vh-200px)] w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none lg:h-[500px]"
                  autoFocus
                />
                <p className="mt-2 text-xs text-slate-400">
                  Notes auto-save and sync across your devices.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}