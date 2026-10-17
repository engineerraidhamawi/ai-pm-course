"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";

type Props = {
  moduleId: string;
  onToast: (msg: string, variant?: "default" | "success" | "error") => void;
};

export function ModuleFeedback({ moduleId, onToast }: Props) {
  const { student } = useSession();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/feedback?studentId=${student.id}&moduleId=${moduleId}`);
        const data = await res.json();
        if (!cancelled && data.feedback) {
          setRating(data.feedback.rating);
          setComment(data.feedback.comment ?? "");
          setSubmitted(true);
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [student, moduleId]);

  async function handleSubmit() {
    if (!student || rating === 0) return;
    try {
      await fetch("/api/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          moduleId,
          rating,
          comment: comment.trim() || null,
        }),
      });
      setSubmitted(true);
      onToast("Thanks for your feedback! 🌟", "success");
    } catch {
      onToast("Failed to submit feedback", "error");
    }
  }

  if (loading || !student) return null;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-3 text-sm font-bold text-slate-900">
        {submitted ? "Your Feedback" : "Rate this module"}
      </h3>
      
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !submitted && setRating(star)}
            onMouseEnter={() => !submitted && setHover(star)}
            onMouseLeave={() => !submitted && setHover(0)}
            disabled={submitted}
            className="transition"
          >
            <Star
              className={cn(
                "h-7 w-7 transition",
                (hover || rating) >= star
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300"
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-slate-500">
          {rating > 0 ? `${rating} / 5` : "Click to rate"}
        </span>
      </div>

      {!submitted && (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional: What did you think of this module? Any suggestions?"
            className="mt-3 h-20 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={rating === 0}
            size="sm"
            className="mt-2 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Submit Feedback
          </Button>
        </>
      )}

      {submitted && comment && (
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm italic text-slate-600">
          "{comment}"
        </p>
      )}
    </div>
  );
}