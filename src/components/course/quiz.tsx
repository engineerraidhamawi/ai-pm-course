"use client";

import { useState } from "react";
import { Module, QuizQuestion } from "@/lib/course-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  quiz: QuizQuestion[];
  onPass: () => void;
};

export function Quiz({ quiz, onPass }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);

  const allAnswered = answers.every((a) => a !== null);
  const correctCount = answers.filter((a, i) => a === quiz[i].correctIndex).length;
  const passThreshold = Math.ceil(quiz.length * 0.7); // 70% to pass

  function selectAnswer(qIndex: number, optIndex: number) {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
  }

  function handleSubmit() {
    setSubmitted(true);
    if (correctCount >= passThreshold) {
      setPassed(true);
      onPass();
    }
  }

  function handleRetry() {
    setAnswers(quiz.map(() => null));
    setSubmitted(false);
    setPassed(false);
  }

  if (passed) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow">
          <Trophy className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-emerald-800">Quiz Passed! 🎉</h3>
        <p className="mt-1 text-sm text-emerald-700">
          You scored {correctCount}/{quiz.length}. You can now mark this module complete.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50/50 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-sky-700">
          <HelpCircle className="h-4 w-4" />
          Module Quiz
        </h3>
        <Badge variant="outline" className="text-slate-600">
          {passThreshold}/{quiz.length} required to pass
        </Badge>
      </div>

      <div className="space-y-5">
        {quiz.map((q, qIndex) => (
          <div key={qIndex} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-900">
              {qIndex + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIndex) => {
                const isSelected = answers[qIndex] === optIndex;
                const isCorrect = optIndex === q.correctIndex;
                const showResult = submitted;
                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() => selectAnswer(qIndex, optIndex)}
                    disabled={submitted}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition",
                      !showResult && isSelected && "border-indigo-500 bg-indigo-50",
                      !showResult && !isSelected && "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                      showResult && isCorrect && "border-emerald-500 bg-emerald-50",
                      showResult && isSelected && !isCorrect && "border-red-500 bg-red-50",
                      showResult && !isCorrect && !isSelected && "border-slate-200 opacity-60",
                    )}
                  >
                    <span className={cn(
                      "grid h-5 w-5 flex-none place-items-center rounded-full border text-xs font-bold",
                      !showResult && isSelected && "border-indigo-500 bg-indigo-500 text-white",
                      !showResult && !isSelected && "border-slate-300 text-slate-400",
                      showResult && isCorrect && "border-emerald-500 bg-emerald-500 text-white",
                      showResult && isSelected && !isCorrect && "border-red-500 bg-red-500 text-white",
                    )}>
                      {showResult && isCorrect ? "✓" : showResult && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + optIndex)}
                    </span>
                    <span className={cn("flex-1", showResult && isCorrect && "font-semibold text-emerald-800")}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className={cn(
                "mt-3 rounded-lg p-3 text-xs",
                answers[qIndex] === q.correctIndex
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              )}>
                <strong>{answers[qIndex] === q.correctIndex ? "Correct! " : "Not quite. "}</strong>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {allAnswered ? "Ready to submit!" : `${answers.filter((a) => a !== null).length}/${quiz.length} answered`}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="bg-sky-600 text-white hover:bg-sky-700"
          >
            Submit Quiz
          </Button>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              You scored {correctCount}/{quiz.length}
            </p>
            <p className="text-xs text-slate-500">
              {correctCount >= passThreshold
                ? "You passed! You can now mark this module complete."
                : `You need ${passThreshold} correct to pass. Try again!`}
            </p>
          </div>
          <Button onClick={handleRetry} variant="outline" size="sm">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}