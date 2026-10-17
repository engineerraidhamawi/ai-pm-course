"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ClipboardCheck, Clock, Trophy } from "lucide-react";

export default function PMPTestPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" />
          Back to Learning Hub
        </Link>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-8 text-white">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-10 w-10" />
              <h1 className="text-3xl font-bold">PMP Practice Exam</h1>
            </div>
            <p className="mt-2 text-emerald-50">
              Prepare for your PMP certification with our comprehensive practice test.
            </p>
          </div>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div className="text-lg font-bold text-slate-900">180</div>
                <div className="text-xs text-slate-500">Questions</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-indigo-100 text-indigo-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="text-lg font-bold text-slate-900">230 min</div>
                <div className="text-xs text-slate-500">Duration</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-600">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="text-lg font-bold text-slate-900">Auto-Graded</div>
                <div className="text-xs text-slate-500">Instant Results</div>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-sm font-semibold text-amber-800">
                🚧 Exam Engine Coming Soon! 🚧
              </p>
              <p className="mt-1 text-xs text-amber-700">
                We are currently loading the 180-question bank. Check back soon to start your test.
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Button disabled className="bg-emerald-600 text-white opacity-50">
                Start Exam (Unavailable)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}