import { NextRequest, NextResponse } from "next/server";
import { register } from "../../../../instrumentation";
import { Teacher } from "../../../../db/schema";

export async function GET(req: NextRequest) {
  try {
    await register();

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing teacher ID" }, { status: 400 });
    }

    const teacher = await Teacher.findOne({ id });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(teacher);
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
