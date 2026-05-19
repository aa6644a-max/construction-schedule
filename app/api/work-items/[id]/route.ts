import { NextRequest, NextResponse } from "next/server";
import { getSession, requireWorkItem } from "@/lib/authz";
import { updateWorkItem, deleteWorkItem } from "@/lib/services/workItemService";
import { WorkItemUpdateSchema } from "@/lib/schemas";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await requireWorkItem(Number(id), Number(session.user.id));
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = WorkItemUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await updateWorkItem(Number(id), parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await requireWorkItem(Number(id), Number(session.user.id));
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteWorkItem(Number(id));
  return new NextResponse(null, { status: 204 });
}
