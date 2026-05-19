import { NextRequest, NextResponse } from "next/server";
import { getSession, requireProject } from "@/lib/authz";
import { regenerateShareToken } from "@/lib/services/projectService";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await requireProject(Number(id), Number(session.user.id));
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await regenerateShareToken(Number(id));
  return NextResponse.json({ shareToken: updated.shareToken });
}
