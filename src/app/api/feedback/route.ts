import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — fetch feedback for a specific module (for instructor dashboard)
export async function GET(req: NextRequest) {
  try {
    const moduleId = req.nextUrl.searchParams.get("moduleId")?.trim();
    const studentId = req.nextUrl.searchParams.get("studentId")?.trim();

    // If studentId is provided, fetch that student's feedback for a module
    if (studentId && moduleId) {
      const feedback = await db.feedback.findUnique({
        where: { studentId_moduleId: { studentId, moduleId } },
      });
      return NextResponse.json({ feedback });
    }

    // If only moduleId is provided, fetch all feedback for that module
    if (moduleId) {
      const feedbacks = await db.feedback.findMany({ where: { moduleId } });
      const avgRating = feedbacks.length > 0 
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
        : 0;
      return NextResponse.json({ feedbacks, avgRating, count: feedbacks.length });
    }

    // Otherwise, fetch ALL feedback (for instructor dashboard)
    const allFeedback = await db.feedback.findMany();
    return NextResponse.json({ feedback: allFeedback });
  } catch (e) {
    console.error("[GET /api/feedback] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT — save or update feedback
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const studentId = String(body?.studentId ?? "").trim();
    const moduleId = String(body?.moduleId ?? "").trim();
    const rating = Number(body?.rating);
    const comment = String(body?.comment ?? "").trim() || null;

    if (!studentId || !moduleId || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Valid studentId, moduleId, and rating (1-5) are required" },
        { status: 400 },
      );
    }

    const feedback = await db.feedback.upsert({
      where: { studentId_moduleId: { studentId, moduleId } },
      update: { rating, comment },
      create: { studentId, moduleId, rating, comment },
    });

    return NextResponse.json({ feedback });
  } catch (e) {
    console.error("[PUT /api/feedback] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}