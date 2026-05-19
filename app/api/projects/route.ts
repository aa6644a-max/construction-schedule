import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/authz";
import { listProjects, createProject } from "@/lib/services/projectService";
import { ProjectCreateSchema } from "@/lib/schemas";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await listProjects(Number(session.user.id));
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = ProjectCreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const project = await createProject(Number(session.user.id), parsed.data);
  return NextResponse.json(project, { status: 201 });
}
