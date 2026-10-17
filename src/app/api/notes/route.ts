import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — fetch a student's note for a specific module
export async function GET(req: NextRequest) {
  try {
    const studentId = req.nextUrl.searchParams.get("studentId")?.trim();
    const moduleId = req.nextUrl.searchParams.get("moduleId")?.trim();

    if (!studentId || !moduleId) {
      return NextResponse.json(
        { error: "studentId and moduleId are required" },
        { status: 400 },
      );
    }

    const note = await db.note.findUnique({
      where: { studentId_moduleId: { studentId, moduleId } },
    });

    return NextResponse.json({ note: note?.content ?? "" });
  } catch (e) {
    console.error("[GET /api/notes] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT — save or update a note
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const studentId = String(body?.studentId ?? "").trim();
    const moduleId = String(body?.moduleId ?? "").trim();
    const content = String(body?.content ?? "");

    if (!studentId || !moduleId) {
      return NextResponse.json(
        { error: "studentId and moduleId are required" },
        { status: 400 },
      );
    }

    const note = await db.note.upsert({
      where: { studentId_moduleId: { studentId, moduleId } },
      update: { content },
      create: { studentId, moduleId, content },
    });

    return NextResponse.json({ note });
  } catch (e) {
    console.error("[PUT /api/notes] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}