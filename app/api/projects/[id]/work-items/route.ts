import { NextRequest, NextResponse } from "next/server";
import { getSession, requireProject } from "@/lib/authz";
import { listWorkItems, createWorkItem } from "@/lib/services/workItemService";
import { WorkItemCreateSchema } from "@/lib/schemas";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await requireProject(Number(id), Number(session.user.id));
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await listWorkItems(Number(id));
  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await requireProject(Number(id), Number(session.user.id));
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = WorkItemCreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const item = await createWorkItem(Number(id), parsed.data);
  return NextResponse.json(item, { status: 201 });
}
