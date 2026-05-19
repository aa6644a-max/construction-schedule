import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./db";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireProject(projectId: number, userId: number) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== userId) return null;
  return project;
}

export async function requireWorkItem(itemId: number, userId: number) {
  const item = await prisma.workItem.findUnique({
    where: { id: itemId },
    include: { project: true },
  });
  if (!item || item.project.userId !== userId) return null;
  return item;
}
