import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendCompletionEmail } from "@/lib/email";

type Status = "not_started" | "in_progress" | "completed";

function normaliseStatus(s: unknown): Status {
  return s === "completed" || s === "in_progress" || s === "not_started"
    ? (s as Status)
    : "not_started";
}

export async function GET(req: NextRequest) {
  try {
    const studentId = req.nextUrl.searchParams.get("studentId")?.trim();
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }
    const progress = await db.progress.findMany({ where: { studentId } });
    return NextResponse.json({ progress });
  } catch (e) {
    console.error("[GET /api/progress] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const studentId = String(body?.studentId ?? "").trim();
    const moduleId = String(body?.moduleId ?? "").trim();
    const status = normaliseStatus(body?.status);
    const percent = Math.max(0, Math.min(100, Number(body?.percent ?? 0) || 0));

    if (!studentId || !moduleId) {
      return NextResponse.json(
        { error: "studentId and moduleId are required" },
        { status: 400 },
      );
    }

    const student = await db.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const completedAt = status === "completed" ? new Date() : null;

    const progress = await db.progress.upsert({
      where: { studentId_moduleId: { studentId, moduleId } },
      update: {
        status,
        percent: status === "completed" ? 100 : percent,
        completedAt: status === "completed" ? new Date() : null,
        lastVisited: new Date(),
      },
      create: {
        studentId,
        moduleId,
        status,
        percent: status === "completed" ? 100 : percent,
        completedAt,
        lastVisited: new Date(),
      },
    });

    // Check if this completion marks the final module — send congrats email
    if (status === "completed") {
      const allProgress = await db.progress.findMany({ where: { studentId } });
      const completedCount = allProgress.filter((p) => p.status === "completed").length;
      // 18 modules total — if this is the 18th completion, send email
      if (completedCount === 18) {
        await sendCompletionEmail(student.name, student.email);
      }
    }

    return NextResponse.json({ progress });
  } catch (e) {
    console.error("[PUT /api/progress] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const studentId = req.nextUrl.searchParams.get("studentId")?.trim();
    const moduleId = req.nextUrl.searchParams.get("moduleId")?.trim();
    if (!studentId || !moduleId) {
      return NextResponse.json(
        { error: "studentId and moduleId are required" },
        { status: 400 },
      );
    }
    await db.progress.deleteMany({ where: { studentId, moduleId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/progress] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}