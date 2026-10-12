import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid name and email are required." },
        { status: 400 },
      );
    }

    const student = await db.student.upsert({
      where: { email },
      update: { name },
      create: { name, email },
    });

    return NextResponse.json({ student });
  } catch (e) {
    console.error("[POST /api/students] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    const student = await db.student.findUnique({
      where: { email },
      include: { progress: true },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ student });
  } catch (e) {
    console.error("[GET /api/students] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update lastVisitedModule
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const studentId = String(body?.studentId ?? "").trim();
    const lastVisitedModule = String(body?.lastVisitedModule ?? "").trim();

    if (!studentId || !lastVisitedModule) {
      return NextResponse.json(
        { error: "studentId and lastVisitedModule are required" },
        { status: 400 },
      );
    }

    const student = await db.student.update({
      where: { id: studentId },
      data: { lastVisitedModule },
    });

    return NextResponse.json({ student });
  } catch (e) {
    console.error("[PATCH /api/students] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}