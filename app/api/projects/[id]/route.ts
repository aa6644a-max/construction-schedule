import { NextRequest, NextResponse } from "next/server";
import { getSession, requireProject } from "@/lib/authz";
import { updateProject, deleteProject } from "@/lib/services/projectService";
import { ProjectUpdateSchema } from "@/lib/schemas";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await requireProject(Number(id), Number(session.user.id));
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await requireProject(Number(id), Number(session.user.id));
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = ProjectUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await updateProject(Number(id), parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await requireProject(Number(id), Number(session.user.id));
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteProject(Number(id));
  return new NextResponse(null, { status: 204 });
}
