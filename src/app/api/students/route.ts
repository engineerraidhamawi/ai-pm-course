import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

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

    // Send welcome email (only if this is a new student)
    const isNewStudent = Date.now() - new Date(student.createdAt).getTime() < 60000;
    if (isNewStudent) {
      await sendWelcomeEmail(name, email);
    }

    return NextResponse.json({ student });
  } catch (e) {
    console.error("[POST /api/students] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// BULK ADD — accepts an array of {name, email} objects
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const students = body?.students as Array<{ name: string; email: string }>;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: "students array is required" },
        { status: 400 },
      );
    }

    const results = {
      added: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const s of students) {
      const name = String(s?.name ?? "").trim();
      const email = String(s?.email ?? "").trim().toLowerCase();

      if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        results.failed++;
        results.errors.push(`Invalid: ${name} <${email}>`);
        continue;
      }

      try {
        const existing = await db.student.findUnique({ where: { email } });
        if (existing) {
          await db.student.update({ where: { email }, data: { name } });
          results.updated++;
        } else {
          await db.student.create({ data: { name, email } });
          results.added++;
          // Send welcome email for new students
          await sendWelcomeEmail(name, email);
        }
      } catch (e) {
        results.failed++;
        results.errors.push(`Error: ${name} <${email}>`);
      }
    }

    return NextResponse.json({ results });
  } catch (e) {
    console.error("[PUT /api/students] bulk add error", e);
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

// DELETE — delete a single student by ID (via query param) or bulk delete via body
export async function DELETE(req: NextRequest) {
  try {
    // Single delete via query param
    const studentId = req.nextUrl.searchParams.get("studentId")?.trim();
    if (studentId) {
      await db.student.delete({ where: { id: studentId } });
      return NextResponse.json({ ok: true, deleted: 1 });
    }

    // Bulk delete via body
    const body = await req.json();
    const studentIds = body?.studentIds as string[];

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "studentId (query) or studentIds (body) is required" },
        { status: 400 },
      );
    }

    const result = await db.student.deleteMany({
      where: { id: { in: studentIds } },
    });

    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (e) {
    console.error("[DELETE /api/students] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}