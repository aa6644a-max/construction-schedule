import { z } from "zod";

export const ProjectCreateSchema = z.object({
  name: z.string().min(1),
  siteName: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export const ProjectUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  siteName: z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const WorkItemCreateSchema = z.object({
  parentId: z.number().nullable().optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  weight: z.number().min(0).max(1).optional(),
  plannedStart: z.string().nullable().optional(),
  plannedEnd: z.string().nullable().optional(),
});

export const WorkItemUpdateSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  weight: z.number().min(0).max(1).optional(),
  plannedStart: z.string().nullable().optional(),
  plannedEnd: z.string().nullable().optional(),
  actualProgress: z.number().min(0).max(100).optional(),
  sortOrder: z.number().int().optional(),
});
