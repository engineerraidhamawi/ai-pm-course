"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { registerStudent, useSession } from "@/lib/session";

type Props = {
  open: boolean;
  onClose: () => void;
  onToast: (msg: string, variant?: "default" | "success" | "error") => void;
};

export function EnrollmentDialog({ open, onClose, onToast }: Props) {
  const { setStudent, setProgress } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const student = await registerStudent(name.trim(), email.trim());
      setStudent(student);
      try {
        const existing = await fetch(`/api/progress?studentId=${student.id}`).then((r) => r.json());
        const map: Record<string, { status: "not_started" | "in_progress" | "completed"; percent: number; lastVisited: string; completedAt?: string | null }> = {};
        for (const row of existing.progress ?? []) {
          map[row.moduleId] = {
            status: row.status,
            percent: row.percent ?? 0,
            lastVisited: row.lastVisited,
            completedAt: row.completedAt,
          };
        }
        setProgress(map);
      } catch {}
      onToast(`Welcome, ${student.name}! 🎓`, "success");
      onClose();
      setName("");
      setEmail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not register.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-3 flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
              <Sparkles className="h-3 w-3" />
              Start learning
            </div>
          </div>
          <DialogTitle className="text-xl">Enroll in the course</DialogTitle>
          <DialogDescription>
            Enter your name and email to start tracking your progress. Use the same email to resume across devices.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="enroll-name">Full name</Label>
            <Input
              id="enroll-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              disabled={submitting}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enroll-email">Email</Label>
            <Input
              id="enroll-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
              disabled={submitting}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling…
              </>
            ) : (
              "Start learning →"
            )}
          </Button>
          <p className="text-center text-xs text-slate-400">
            No password needed. Your email is your identity.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}