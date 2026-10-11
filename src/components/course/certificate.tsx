"use client";

import { useMemo } from "react";
import { Module } from "@/lib/course-data";
import { Student } from "@/lib/session";
import { Download } from "lucide-react";
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
    const hash = student.id.slice(-8).toUpperCase();
    return `AIPM-${hash}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
  }, [student.id]);

  if (completedCount < modules.length) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6">
      <div className="mb-6 text-center">
        <Button onClick={onPrint} className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Download className="mr-1.5 h-4 w-4" />
          Download Certificate (PDF)
        </Button>
      </div>

      {/* Certificate */}
      <div
        id="certificate-paper"
        className="relative overflow-hidden bg-white shadow-2xl"
        style={{ aspectRatio: "1.414 / 1", fontFamily: "Georgia, serif" }}
      >
        {/* Subtle guilloche texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px),
              repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)
            `,
          }}
        />

        {/* Left gold accent stripes */}
        <div className="absolute left-0 top-0 h-full w-2 bg-amber-500" />
        <div className="absolute left-3 top-0 h-full w-px bg-amber-400" />

        {/* Diagonal wave shape — dark navy to white */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 707"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="navyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="goldWave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>
          {/* Navy diagonal shape */}
          <path
            d="M 0,0 L 1000,0 L 1000,180 Q 500,280 0,400 Z"
            fill="url(#navyGradient)"
          />
          {/* Gold wave accent */}
          <path
            d="M 0,400 Q 500,280 1000,180 L 1000,200 Q 500,300 0,420 Z"
            fill="url(#goldWave)"
            opacity="0.85"
          />
        </svg>

        {/* Content layer */}
        <div className="relative h-full p-10 sm:p-14">
          {/* Header — top left in navy area */}
          <div className="text-white">
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300" style={{ fontFamily: "system-ui, sans-serif" }}>
              AI-Powered Project Management
            </div>
            <h1
              className="text-4xl font-bold tracking-wider text-amber-400 sm:text-5xl"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "0.1em" }}
            >
              CERTIFICATE
            </h1>
            <p
              className="text-sm font-semibold uppercase tracking-[0.4em] text-white/90 sm:text-base"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              of Completion
            </p>
          </div>

          {/* Award ribbon — left side, overlapping the wave */}
          <div className="absolute left-8 top-[42%] -translate-y-1/2 sm:left-14">
            <div className="relative">
              {/* Rosette */}
              <div className="relative grid h-20 w-20 place-items-center sm:h-24 sm:w-24">
                {/* Sunburst rays */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i * 22.5 * Math.PI) / 180;
                    const x1 = 50 + Math.cos(angle) * 38;
                    const y1 = 50 + Math.sin(angle) * 38;
                    const x2 = 50 + Math.cos(angle) * 48;
                    const y2 = 50 + Math.sin(angle) * 48;
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    );
                  })}
                  <circle cx="50" cy="50" r="34" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="#fde68a" strokeWidth="1" />
                </svg>
                {/* Center text */}
                <div className="relative z-10 text-center">
                  <div className="text-[10px] italic text-amber-900 sm:text-xs" style={{ fontFamily: "Georgia, serif" }}>Best</div>
                  <div className="text-[10px] font-bold uppercase text-amber-900 sm:text-xs" style={{ fontFamily: "Georgia, serif" }}>Award</div>
                  <div className="text-[8px] text-amber-800 sm:text-[10px]" style={{ fontFamily: "system-ui, sans-serif" }}>2026</div>
                </div>
              </div>
              {/* Ribbons hanging below */}
              <svg viewBox="0 0 80 60" className="mx-auto -mt-2 h-12 w-16 sm:h-16 sm:w-20">
                <path d="M 20,0 L 30,50 L 40,5 L 50,50 L 60,0 Z" fill="#d97706" />
                <path d="M 25,0 L 35,45 L 40,5 Z" fill="#f59e0b" opacity="0.7" />
                <path d="M 55,0 L 45,45 L 40,5 Z" fill="#f59e0b" opacity="0.7" />
              </svg>
            </div>
          </div>

                    {/* Body — recipient name and description (centered, lower) */}
          <div className="absolute left-1/2 top-[58%] w-full max-w-[80%] -translate-x-1/2 -translate-y-1/2 px-10 text-center sm:px-14">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 sm:text-sm"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              This certificate is proudly presented for honorable achievement to
            </p>
            <h2
              className="my-3 text-5xl italic text-slate-900 sm:text-6xl"
              style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive" }}
            >
              {student.name}
            </h2>
            <div className="mx-auto mb-3 h-px w-40 bg-amber-500 sm:w-48" />
            <p
              className="text-base font-bold uppercase tracking-[0.2em] text-slate-800 sm:text-lg"
              style={{ fontFamily: "Georgia, serif" }}
            >
              AI-Powered Project Management
            </p>
            <p
              className="mx-auto mt-3 max-w-2xl text-[11px] uppercase tracking-wide text-slate-500 sm:text-sm"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              has successfully completed all 18 modules of the course, demonstrating proficiency in using AI tools for project planning, documentation, communication, and reporting.
            </p>
          </div>
          {/* Footer — signature lines and seals */}
          <div className="absolute bottom-8 left-0 right-0 px-10 sm:px-14">
            <div className="flex items-end justify-between">
              {/* Left signature */}
              <div className="text-center">
                <div className="mb-1 h-px w-32 bg-slate-400 sm:w-40" />
                <p
                  className="text-[9px] uppercase tracking-[0.2em] text-slate-500 sm:text-[10px]"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Signature
                </p>
              </div>

              {/* Center left — guarantee seal */}
              <div className="flex flex-col items-center">
                <svg viewBox="0 0 60 60" className="h-12 w-12 sm:h-14 sm:w-14">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="30" cy="30" r="22" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
                  <text x="30" y="20" textAnchor="middle" fontSize="6" fill="#1e293b" fontFamily="Georgia, serif" fontWeight="bold">GUARANTEE</text>
                  <text x="30" y="32" textAnchor="middle" fontSize="7" fill="#1e293b" fontFamily="Georgia, serif" fontWeight="bold">★</text>
                  <text x="30" y="42" textAnchor="middle" fontSize="6" fill="#1e293b" fontFamily="Georgia, serif" fontWeight="bold">QUALITY</text>
                </svg>
              </div>

              {/* Center right — date */}
              <div className="text-center">
                <p
                  className="text-sm font-semibold text-slate-900 sm:text-base"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {completionDate}
                </p>
                <div className="mx-auto mt-1 h-px w-24 bg-slate-400 sm:w-32" />
                <p
                  className="mt-1 text-[9px] uppercase tracking-[0.2em] text-slate-500 sm:text-[10px]"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Date of Completion
                </p>
              </div>

              {/* Center far right — red wax seal */}
              <div className="flex flex-col items-center">
                <svg viewBox="0 0 60 70" className="h-14 w-12 sm:h-16 sm:w-14">
                  {/* Ribbon */}
                  <path d="M 22,30 L 18,68 L 30,55 L 42,68 L 38,30 Z" fill="#7f1d1d" />
                  <path d="M 25,30 L 22,60 L 30,52 Z" fill="#991b1b" />
                  <path d="M 35,30 L 38,60 L 30,52 Z" fill="#991b1b" />
                  {/* Wax seal */}
                  <circle cx="30" cy="25" r="18" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
                  <circle cx="30" cy="25" r="15" fill="none" stroke="#dc2626" strokeWidth="1" />
                  <text x="30" y="22" textAnchor="middle" fontSize="5" fill="#fef2f2" fontFamily="Georgia, serif" fontWeight="bold">CERTIFIED</text>
                  <text x="30" y="29" textAnchor="middle" fontSize="6" fill="#fbbf24" fontFamily="Georgia, serif" fontWeight="bold">★</text>
                </svg>
              </div>

              {/* Right signature */}
              <div className="text-center">
                <div className="mb-1 h-px w-32 bg-slate-400 sm:w-40" />
                <p
                  className="text-[9px] uppercase tracking-[0.2em] text-slate-500 sm:text-[10px]"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Signature
                </p>
              </div>
            </div>

            {/* Certificate ID — bottom right */}
            <div className="mt-4 text-right">
              <p
                className="text-[9px] uppercase tracking-[0.2em] text-slate-400 sm:text-[10px]"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Certificate ID: <span className="font-mono font-semibold text-slate-600">{certificateId}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}