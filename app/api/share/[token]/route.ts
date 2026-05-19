import { NextRequest, NextResponse } from "next/server";
import { getSharedProject } from "@/lib/services/projectService";

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const project = await getSharedProject(token);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}
