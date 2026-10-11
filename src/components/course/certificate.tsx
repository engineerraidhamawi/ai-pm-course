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
    return `AIPM-${hash}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
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
        className="relative overflow-hidden bg-[#F0F4F8] shadow-2xl"
        style={{ aspectRatio: "1.414 / 1" }}
      >
        {/* Topographic watermark background */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
          viewBox="0 0 1000 707"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" stroke="#5D7B93" strokeWidth="0.8">
            {/* Organic contour-like loops */}
            <path d="M 200,350 Q 300,250 400,350 T 600,350 T 800,350" />
            <path d="M 180,400 Q 280,300 380,400 T 580,400 T 780,400" />
            <path d="M 220,300 Q 320,200 420,300 T 620,300 T 820,300" />
            <path d="M 160,450 Q 260,350 360,450 T 560,450 T 760,450" />
            <path d="M 240,250 Q 340,150 440,250 T 640,250 T 840,250" />
            <path d="M 140,500 Q 240,400 340,500 T 540,500 T 740,500" />
            {/* Cloud-like loops */}
            <ellipse cx="500" cy="350" rx="350" ry="200" />
            <ellipse cx="500" cy="350" rx="300" ry="160" />
            <ellipse cx="500" cy="350" rx="250" ry="120" />
            <ellipse cx="500" cy="350" rx="200" ry="80" />
            {/* Neural network nodes */}
            <circle cx="350" cy="280" r="4" fill="#5D7B93" />
            <circle cx="650" cy="280" r="4" fill="#5D7B93" />
            <circle cx="500" cy="200" r="4" fill="#5D7B93" />
            <circle cx="400" cy="450" r="4" fill="#5D7B93" />
            <circle cx="600" cy="450" r="4" fill="#5D7B93" />
            <line x1="350" y1="280" x2="500" y2="200" />
            <line x1="650" y1="280" x2="500" y2="200" />
            <line x1="350" y1="280" x2="400" y2="450" />
            <line x1="650" y1="280" x2="600" y2="450" />
            <line x1="400" y1="450" x2="600" y2="450" />
          </g>
        </svg>

        {/* Outer frame — thin solid line */}
        <div className="absolute inset-[24px] border border-[#B8CDD9]" />

        {/* Corner squares — bright blue, on the outer frame */}
        <div className="absolute left-[18px] top-[18px] h-3 w-3 bg-[#2E86DE]" />
        <div className="absolute right-[18px] top-[18px] h-3 w-3 bg-[#2E86DE]" />
        <div className="absolute bottom-[18px] left-[18px] h-3 w-3 bg-[#2E86DE]" />
        <div className="absolute bottom-[18px] right-[18px] h-3 w-3 bg-[#2E86DE]" />

        {/* Inner dotted border */}
        <div
          className="absolute inset-[44px]"
          style={{ border: "1px dotted #A4C3D6" }}
        />

        {/* Content layer */}
        <div className="relative h-full px-14 py-12 sm:px-20 sm:py-16">
          {/* ===== HEADER (Top Left) ===== */}
          <div className="flex items-start justify-between">
            {/* Logo — left */}
            <div className="flex items-center gap-3">
              <img
                src="/course-logo.png"
                alt="AI logo"
                className="h-14 w-14 rounded-lg object-cover sm:h-16 sm:w-16"
              />
              <div>
                <p
                  className="text-xl italic text-[#5D7B93] sm:text-2xl"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Dr. Raid Hamawi
                </p>
                <p
                  className="text-[8px] font-semibold uppercase tracking-[0.3em] text-[#8FAABB] sm:text-[10px]"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Artificial Intelligence
                </p>
              </div>
            </div>

            {/* Serial number — top right */}
            <div className="text-right">
              <p
                className="text-[8px] uppercase tracking-[0.2em] text-[#7F8C8D] sm:text-[9px]"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Serial No.
              </p>
              <p
                className="mt-1 text-xs font-semibold text-[#2C3E50] sm:text-sm"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {certificateId}
              </p>
            </div>
          </div>

          {/* ===== TITLE BLOCK (Center-Top) ===== */}
          <div className="mt-8 text-center sm:mt-12">
            <h1
              className="text-4xl font-normal uppercase tracking-[0.5em] text-[#1A2B3C] sm:text-5xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Certificate
            </h1>
            <p
              className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#2E86DE] sm:text-sm"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              of Excellence in Artificial Intelligence
            </p>

            {/* Diamond divider */}
            <div className="mx-auto mt-5 flex items-center justify-center gap-2">
              <div className="h-px w-24 bg-[#B8CDD9] sm:w-32" />
              <div className="h-2 w-2 rotate-45 border border-[#B8CDD9]" />
              <div className="h-px w-24 bg-[#B8CDD9] sm:w-32" />
            </div>
          </div>

          {/* ===== BODY (Center) ===== */}
          <div className="mt-8 text-center sm:mt-10">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5D7B93] sm:text-xs"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              This is to certify that
            </p>
            <h2
              className="mt-4 text-4xl uppercase tracking-[0.05em] text-[#2E86DE] sm:text-5xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {student.name}
            </h2>
            <p
              className="mt-4 text-sm italic text-[#5D6D7E] sm:text-base"
              style={{ fontFamily: "Georgia, serif" }}
            >
              has met every requirement and is hereby awarded
            </p>
            <p
              className="mt-3 text-lg font-semibold uppercase tracking-[0.1em] text-[#2E86DE] sm:text-xl"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              AI-Powered Project Management
            </p>
            <p
              className="mx-auto mt-4 max-w-xl text-[10px] uppercase tracking-wide text-[#5D7B93] sm:text-xs"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              having successfully completed all 18 modules demonstrating proficiency in AI tools for project planning, documentation, communication, and reporting
            </p>
          </div>

          {/* ===== FOOTER (Bottom) ===== */}
          <div className="absolute bottom-10 left-14 right-14 sm:bottom-12 sm:left-20 sm:right-20">
            <div className="flex items-end justify-between">
              {/* Date — bottom left */}
              <div className="text-left">
                <p
                  className="text-[8px] uppercase tracking-[0.2em] text-[#7F8C8D] sm:text-[9px]"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Date of Issue
                </p>
                <div className="mt-2 h-px w-28 bg-[#BDC3C7] sm:w-36" />
                <p
                  className="mt-1 text-xs font-semibold text-[#2C3E50] sm:text-sm"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {completionDate}
                </p>
              </div>

              {/* Signature — center-left */}
              <div className="text-center">
                <div className="mb-2 h-px w-32 bg-[#BDC3C7] sm:w-40" />
                <p
                  className="text-[8px] uppercase tracking-[0.2em] text-[#7F8C8D] sm:text-[9px]"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Authorized Signatory
                </p>
              </div>

              {/* Circular seal — center */}
              <div className="flex flex-col items-center">
                <svg viewBox="0 0 100 100" className="h-20 w-20 sm:h-24 sm:w-24">
                  {/* Outer ring */}
                  <circle cx="50" cy="50" r="46" fill="#1B2631" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#34495E" strokeWidth="1" strokeDasharray="2,2" />
                  {/* Inner circle */}
                  <circle cx="50" cy="50" r="36" fill="#34495E" />
                  <circle cx="50" cy="50" r="34" fill="none" stroke="#5D7B93" strokeWidth="1" />
                  {/* Top arc text — CERTIFIED */}
                  <path id="topArc" d="M 15,50 A 35,35 0 0 1 85,50" fill="none" />
                  <text fontSize="7" fill="#ECF0F1" fontFamily="system-ui, sans-serif" fontWeight="600" letterSpacing="2">
                    <textPath href="#topArc" startOffset="50%" textAnchor="middle">CERTIFIED</textPath>
                  </text>
                  {/* Bottom arc text — DR. RAID HAMAWI */}
                  <path id="bottomArc" d="M 18,55 A 33,33 0 0 0 82,55" fill="none" />
                  <text fontSize="5" fill="#BDC3C7" fontFamily="system-ui, sans-serif" letterSpacing="1.5">
                    <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">DR. RAID HAMAWI</textPath>
                  </text>
                  {/* Center AI */}
                  <text x="50" y="56" textAnchor="middle" fontSize="20" fill="#ECF0F1" fontFamily="Georgia, serif" fontWeight="bold">AI</text>
                </svg>
              </div>

              {/* QR code — bottom right */}
              <div className="flex flex-col items-center">
                <div className="relative border-2 border-[#2E86DE] p-1.5">
                  {/* Corner brackets */}
                  <div className="absolute -left-1 -top-1 h-2 w-2 border-l-2 border-t-2 border-[#2E86DE]" />
                  <div className="absolute -right-1 -top-1 h-2 w-2 border-r-2 border-t-2 border-[#2E86DE]" />
                  <div className="absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-[#2E86DE]" />
                  <div className="absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 border-[#2E86DE]" />
                  {/* QR placeholder */}
                  <div className="grid h-16 w-16 grid-cols-7 grid-rows-7 gap-px sm:h-20 sm:w-20">
                    {/* Position markers (3 corners) */}
                    <div className="col-span-2 row-span-2 border-2 border-black bg-white">
                      <div className="m-0.5 h-full w-full bg-black p-1">
                        <div className="h-full w-full bg-white">
                          <div className="m-0.5 h-full w-full bg-black" />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 col-start-6 row-span-2 border-2 border-black bg-white">
                      <div className="m-0.5 h-full w-full bg-black p-1">
                        <div className="h-full w-full bg-white">
                          <div className="m-0.5 h-full w-full bg-black" />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 row-span-2 row-start-6 border-2 border-black bg-white">
                      <div className="m-0.5 h-full w-full bg-black p-1">
                        <div className="h-full w-full bg-white">
                          <div className="m-0.5 h-full w-full bg-black" />
                        </div>
                      </div>
                    </div>
                    {/* Random data dots */}
                    {[
                      [3,1],[4,1],[5,1],[1,3],[3,3],[5,3],[2,4],[4,4],[6,4],
                      [1,5],[3,5],[5,5],[7,5],[2,6],[4,6],[6,6],[3,7],[5,7],[7,7]
                    ].map(([x, y], i) => (
                      <div key={i} className="bg-black" style={{ gridColumn: x, gridRow: y }} />
                    ))}
                  </div>
                </div>
                <p
                  className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#2E86DE] sm:text-[9px]"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Verify Certificate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}