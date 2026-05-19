import { prisma } from "@/lib/db";

export async function listWorkItems(projectId: number) {
  return prisma.workItem.findMany({
    where: { projectId },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });
}

export async function createWorkItem(
  projectId: number,
  data: {
    parentId?: number | null;
    code: string;
    name: string;
    weight?: number;
    plannedStart?: string | null;
    plannedEnd?: string | null;
  }
) {
  const maxOrder = await prisma.workItem.aggregate({
    where: { projectId, parentId: data.parentId ?? null },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;

  return prisma.workItem.create({
    data: {
      projectId,
      parentId: data.parentId ?? null,
      code: data.code,
      name: data.name,
      weight: data.weight ?? 0,
      plannedStart: data.plannedStart ? new Date(data.plannedStart) : null,
      plannedEnd: data.plannedEnd ? new Date(data.plannedEnd) : null,
      sortOrder,
    },
  });
}

export async function updateWorkItem(
  id: number,
  data: {
    code?: string;
    name?: string;
    weight?: number;
    plannedStart?: string | null;
    plannedEnd?: string | null;
    actualProgress?: number;
    sortOrder?: number;
  }
) {
  return prisma.workItem.update({
    where: { id },
    data: {
      ...(data.code !== undefined && { code: data.code }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.weight !== undefined && { weight: data.weight }),
      ...(data.plannedStart !== undefined && {
        plannedStart: data.plannedStart ? new Date(data.plannedStart) : null,
      }),
      ...(data.plannedEnd !== undefined && {
        plannedEnd: data.plannedEnd ? new Date(data.plannedEnd) : null,
      }),
      ...(data.actualProgress !== undefined && { actualProgress: data.actualProgress }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });
}

export async function deleteWorkItem(id: number) {
  await prisma.workItem.deleteMany({ where: { parentId: id } });
  await prisma.workItem.delete({ where: { id } });
}
