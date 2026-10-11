"use client";

import { Certificate } from "@/components/course/certificate";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  COURSE_META, LEARNING_OUTCOMES, PARTS, MODULES, INTRODUCTION,
  RESOURCES, FINAL_TAKEAWAYS, Module,
} from "@/lib/course-data";
import {
  useSession, useHydrated, fetchStudentProgress, ProgressStatus,
} from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Clock, BookOpen, CheckCircle2, Circle, PlayCircle,
  Trophy, BarChart3, LogOut, Layers, Target, Wrench, TrendingUp,
  ArrowRight, Star,
} from "lucide-react";
import { EnrollmentDialog } from "@/components/course/enrollment-dialog";
import { ModuleReader } from "@/components/course/module-reader";
import { InstructorDashboard } from "@/components/course/instructor-dashboard";

type View = "catalog" | "reader" | "dashboard" | "certificate";

export default function Home() {
  const hydrated = useHydrated();
  const { student, progress, clear } = useSession();
  const [view, setView] = useState<View>("catalog");
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);

  useEffect(() => {
    if (!hydrated || !student) return;
    let cancelled = false;
    (async () => {
      try {
        const map = await fetchStudentProgress(student.id);
        if (!cancelled) useSession.getState().setProgress(map);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [hydrated, student]);

  const totalModules = MODULES.length;
  const completedCount = useMemo(
    () => Object.values(progress).filter((p) => p.status === "completed").length,
    [progress],
  );
  const overallPct = Math.round((completedCount / totalModules) * 100);

  const displayStudent = hydrated ? student : null;
  const displayProgress = hydrated ? progress : {};

  const ALL_MODULES_FOR_LOOKUP = useMemo(() => [INTRODUCTION, ...MODULES], []);
  const activeModule = useMemo(
    () => ALL_MODULES_FOR_LOOKUP.find((m) => m.id === activeModuleId) ?? null,
    [activeModuleId, ALL_MODULES_FOR_LOOKUP],
  );
  const activeIndex = activeModule ? ALL_MODULES_FOR_LOOKUP.findIndex((m) => m.id === activeModule.id) : -1;
  const prevModule = activeIndex > 0 ? ALL_MODULES_FOR_LOOKUP[activeIndex - 1] : undefined;
  const nextModule = activeIndex >= 0 && activeIndex < ALL_MODULES_FOR_LOOKUP.length - 1 ? ALL_MODULES_FOR_LOOKUP[activeIndex + 1] : undefined;

  function notify(msg: string, variant: "default" | "success" | "error" = "default") {
    if (variant === "success") toast.success(msg);
    else if (variant === "error") toast.error(msg);
    else toast(msg);
  }

  function openModule(mod: Module) {
    if (!displayStudent) { setEnrollOpen(true); return; }
    setActiveModuleId(mod.id);
    setView("reader");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }

  function openIntroduction() {
    if (!displayStudent) { setEnrollOpen(true); return; }
    setActiveModuleId(INTRODUCTION.id);
    setView("reader");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }

  function signOut() {
    clear();
    setView("catalog");
    notify("You have been signed out.");
  }

  if (view === "dashboard") {
    return (
      <div className="min-h-screen bg-slate-50">
        <InstructorDashboard onBack={() => setView("catalog")} />
        <Footer />
      </div>
    );
  }
  if (view === "certificate" && displayStudent) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
          <button
            onClick={() => setView("catalog")}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to course
          </button>
        </div>
        <Certificate
          student={displayStudent}
          modules={MODULES}
          completedCount={completedCount}
          onPrint={() => window.print()}
        />
        <Footer />
      </div>
    );
  }
  if (view === "reader" && activeModule) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ModuleReader
          module={activeModule}
          nextModule={nextModule}
          prevModule={prevModule}
          onBack={() => setView("catalog")}
          onNavigate={(id) => {
            setActiveModuleId(id);
            if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
          }}
          onToast={notify}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <img
              src="/course-logo.png"
              alt="AI-Powered Project Management logo"
              className="h-9 w-9 flex-none rounded-lg object-cover shadow"
            />
            <div>
              <p className="text-sm font-bold leading-tight text-slate-900">AI · Project Management</p>
              <p className="text-[11px] leading-tight text-slate-500">Online Course</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView("dashboard")} className="text-slate-600">
              <BarChart3 className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Instructor</span> Dashboard
            </Button>
            {displayStudent ? (
              <div className="flex items-center gap-2">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-semibold text-slate-900">{displayStudent.name}</p>
                  <p className="text-[11px] text-slate-500">{completedCount}/{totalModules} done</p>
                </div>
                <Button variant="outline" size="sm" onClick={signOut} title="Sign out">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setEnrollOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                Enroll
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex items-center gap-4">
            <img
              src="/course-logo.png"
              alt="AI-Powered Project Management logo"
              className="h-16 w-16 flex-none rounded-2xl object-cover shadow-lg ring-1 ring-white/20 sm:h-20 sm:w-20"
            />
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Complete Course Curriculum
            </div>
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {COURSE_META.title}
          </h1>
          <p className="mt-2 text-lg font-medium text-indigo-200 sm:text-xl">{COURSE_META.subtitle}</p>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-200">{COURSE_META.lede}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <StatCard value={String(totalModules)} label="Modules" />
            <StatCard value={String(PARTS.length)} label="Parts" />
            <StatCard value="40–50" label="Hours" />
            <StatCard value="10+" label="Hrs Saved / Week" />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {displayStudent ? (
              <>
                <Button size="lg" onClick={openIntroduction} className="bg-white text-indigo-700 hover:bg-indigo-50">
                  <Star className="mr-1.5 h-4 w-4" />
                  Start with the Introduction
                </Button>
                <Button size="lg" variant="outline" onClick={() => openModule(MODULES[0])}
                  className="border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/10">
                  {completedCount > 0 ? "Continue learning" : "Jump to Module 1"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button size="lg" onClick={() => setEnrollOpen(true)} className="bg-white text-indigo-700 hover:bg-indigo-50">
                Enroll & start learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <a href="#outcomes" className="inline-flex h-11 items-center rounded-lg border border-white/25 bg-white/5 px-5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10">
              View learning outcomes
            </a>
          </div>

          {displayStudent && (
            <div className="mt-8 max-w-md rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-indigo-200">Your overall progress</span>
                <span className="font-bold text-white">{completedCount}/{totalModules} · {overallPct}%</span>
              </div>
              <Progress value={overallPct} className="h-2 bg-white/20" />
                            {overallPct === 100 && (
                <button
                  onClick={() => setView("certificate")}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-amber-600"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  View your certificate
                </button>
              )}
                <p className="mt-2 text-xs font-medium text-amber-200">🎓 Congratulations — you've completed the entire course!</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto -mt-6 max-w-6xl px-4 sm:px-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 sm:p-6">
            <MiniMeta icon={<BookOpen className="h-4 w-4" />} label="Duration" value={COURSE_META.duration} />
            <MiniMeta icon={<Layers className="h-4 w-4" />} label="Format" value="Self-paced or instructor-led" />
            <MiniMeta icon={<Target className="h-4 w-4" />} label="Prerequisites" value="None required" />
            <MiniMeta icon={<TrendingUp className="h-4 w-4" />} label="Outcome" value="Save 10+ hrs/week" />
          </CardContent>
        </Card>
      </section>

      <section id="introduction" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Start Here</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Before You Start — Course Orientation</h2>
          <p className="mt-1 text-sm text-slate-500">A 15-minute orientation that explains what this course is, what it isn't, the one rule, and what you'll need.</p>
        </div>
        <button
          onClick={openIntroduction}
          className="group block w-full rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md sm:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow">
              <Star className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700">{INTRODUCTION.title}</h3>
                {INTRODUCTION.duration && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {INTRODUCTION.duration}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600">Welcome · What this course is and isn't · The One Rule · What you'll need · Pre-course self-assessment</p>
              <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-700">
                Read the orientation
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </p>
            </div>
          </div>
        </button>
      </section>

      <section id="overview" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <SectionTitle eyebrow="Course Overview" title="Everything you need to know before you begin" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Core Objective</CardTitle></CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-700">{COURSE_META.coreObjective}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Audience</CardTitle></CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-700">{COURSE_META.audience}</CardContent>
          </Card>
        </div>
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-base">Instructional Approach</CardTitle></CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {COURSE_META.instructionalApproach.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section id="outcomes" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionTitle eyebrow="Learning Outcomes" title="By the end of this course, learners will be able to…" />
          <div className="grid gap-3 sm:grid-cols-2">
            {LEARNING_OUTCOMES.map((o, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="grid h-7 w-7 flex-none place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">{i + 1}</div>
                <p className="text-sm leading-relaxed text-slate-700">{o}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionTitle
          eyebrow="Curriculum"
          title={`${totalModules} modules across ${PARTS.length} parts`}
          sub="Click any module to open the full lesson, prompts, exercises, and teaching notes."
        />
        {PARTS.map((part) => {
          const partModules = MODULES.filter((m) => m.partNumber === part.number);
          if (partModules.length === 0) return null;
          const partCompleted = partModules.filter((m) => displayProgress[m.id]?.status === "completed").length;
          return (
            <div key={part.number} className="mb-10">
              <div className="mb-4 flex items-center gap-4">
                <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-base font-bold text-white shadow">{part.number}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{part.title}</h3>
                  <p className="text-sm text-slate-500">{part.description}</p>
                </div>
                {displayStudent && (
                  <Badge variant="outline" className="text-slate-600">{partCompleted}/{partModules.length}</Badge>
                )}
              </div>
              <div className="grid gap-3">
                {partModules.map((m) => (
                  <ModuleCard
                    key={m.id}
                    module={m}
                    progressItem={displayProgress[m.id]}
                    studentPresent={!!displayStudent}
                    onClick={() => openModule(m)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section id="resources" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionTitle eyebrow="Resources" title="Tools and expected time savings" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="h-4 w-4 text-indigo-500" />
                  Recommended Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {RESOURCES.toolsByCategory.map((t, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.category}</span>
                    <span className="text-right text-sm text-slate-700">{t.options}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Time Savings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {RESOURCES.timeSavings.map((t, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 text-sm last:border-0 last:pb-0">
                    <span className="text-slate-700">{t.task}</span>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 line-through">{t.traditional}</div>
                      <div className="text-xs font-semibold text-slate-700">{t.ai}</div>
                      <div className="text-xs font-bold text-emerald-600">-{t.savings}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="takeaways" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionTitle eyebrow="Final Takeaways" title="By completing this course, learners will:" />
        <div className="grid gap-3 sm:grid-cols-2">
          {FINAL_TAKEAWAYS.map((t, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <Trophy className="mt-0.5 h-5 w-5 flex-none text-amber-500" />
              <p className="text-sm leading-relaxed text-slate-700">{t}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-600 to-sky-600 text-white shadow-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:p-12">
            <Trophy className="h-10 w-10 text-amber-300" />
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to become an AI-powered project manager?</h2>
            <p className="max-w-xl text-sm text-indigo-100">
              Enroll once and resume from any device. Your progress is saved automatically so you can pick up exactly where you left off.
            </p>
            <Button size="lg" onClick={() => (displayStudent ? openIntroduction() : setEnrollOpen(true))} className="bg-white text-indigo-700 hover:bg-indigo-50">
              {displayStudent ? "Continue learning" : "Enroll now"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      <Footer />

      <EnrollmentDialog open={enrollOpen} onClose={() => setEnrollOpen(false)} onToast={notify} />
    </div>
  );
}

function ModuleCard({
  module: m, progressItem, studentPresent, onClick,
}: {
  module: Module;
  progressItem?: { status: ProgressStatus; percent: number };
  studentPresent: boolean;
  onClick: () => void;
}) {
  const status: ProgressStatus = progressItem?.status ?? "not_started";
  const pct = status === "completed" ? 100 : (progressItem?.percent ?? 0);
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md sm:p-5"
    >
      <div className={
        "grid h-11 w-11 flex-none place-items-center rounded-xl text-base font-bold shadow-sm transition " +
        (status === "completed" ? "bg-emerald-500 text-white"
          : status === "in_progress" ? "bg-indigo-500 text-white"
          : "bg-indigo-50 text-indigo-600 border border-indigo-100")
      }>
        {status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : m.number}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-[15px] font-semibold leading-snug text-slate-900 group-hover:text-indigo-600">{m.title}</h4>
          {status === "completed" && (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Completed</Badge>
          )}
          {status === "in_progress" && (
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">In progress</Badge>
          )}
          {m.supplementary && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Supplementary</Badge>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] text-slate-500">{m.summary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {m.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {m.duration}
            </span>
          )}
          {studentPresent && status !== "not_started" && (
            <div className="flex items-center gap-1.5">
              <Progress value={pct} className="h-1 w-16" />
              <span>{pct}%</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-none self-center text-slate-300 transition group-hover:text-indigo-500">
        {status === "completed" ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          : status === "in_progress" ? <PlayCircle className="h-5 w-5" />
          : <ArrowRight className="h-5 w-5" />}
      </div>
    </button>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[120px] rounded-lg border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
      <div className="text-xl font-extrabold text-white sm:text-2xl">{value}</div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-indigo-200">{label}</div>
    </div>
  );
}

function MiniMeta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
        <img
          src="/course-logo.png"
          alt="AI-Powered Project Management logo"
          className="h-12 w-12 rounded-lg object-cover shadow ring-1 ring-white/10"
        />
        <div>
          <p className="text-sm font-semibold text-white">AI-Powered Project Management — Complete Course Curriculum</p>
          <p className="mt-1 text-xs">18 Modules · 5 Parts + Supplementary · 40–50 Hours · No prior AI experience required</p>
        </div>
      </div>
    </footer>
  );
}