import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Check for instructor password
    const expectedKey = process.env.INSTRUCTOR_KEY;
    if (expectedKey) {
      const authHeader = req.headers.get("authorization");
      const providedKey = authHeader?.replace("Bearer ", "") ?? "";
      if (providedKey !== expectedKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const students = await db.student.findMany({
      include: { progress: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ students });
  } catch (e) {
    console.error("[GET /api/dashboard] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}