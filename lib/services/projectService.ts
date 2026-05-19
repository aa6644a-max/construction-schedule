import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function listProjects(userId: number) {
  const projects = await prisma.project.findMany({
    where: { userId },
    include: { workItems: { select: { actualProgress: true, weight: true, parentId: true } } },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((p) => {
    const leaves = p.workItems.filter((w) => w.parentId !== null);
    const totalWeight = leaves.reduce((s, w) => s + w.weight, 0);
    const progress =
      totalWeight > 0
        ? leaves.reduce((s, w) => s + (w.actualProgress * w.weight) / totalWeight, 0)
        : 0;
    return { ...p, workItems: undefined, overallProgress: Math.round(progress) };
  });
}

export async function createProject(
  userId: number,
  data: { name: string; siteName: string; startDate: string; endDate: string }
) {
  return prisma.project.create({
    data: {
      userId,
      name: data.name,
      siteName: data.siteName,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      shareToken: uuidv4(),
    },
  });
}

export async function getProject(id: number) {
  return prisma.project.findUnique({ where: { id } });
}

export async function updateProject(
  id: number,
  data: { name?: string; siteName?: string; startDate?: string; endDate?: string }
) {
  return prisma.project.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.siteName && { siteName: data.siteName }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
    },
  });
}

export async function deleteProject(id: number) {
  return prisma.project.delete({ where: { id } });
}

export async function regenerateShareToken(id: number) {
  return prisma.project.update({
    where: { id },
    data: { shareToken: uuidv4() },
  });
}

export async function getSharedProject(token: string) {
  return prisma.project.findUnique({
    where: { shareToken: token },
    include: {
      workItems: {
        orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
      },
    },
  });
}
