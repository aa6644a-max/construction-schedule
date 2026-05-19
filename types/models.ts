export interface WorkItem {
  id: number;
  projectId: number;
  parentId: number | null;
  code: string;
  name: string;
  weight: number;
  plannedStart: string | null;
  plannedEnd: string | null;
  actualProgress: number;
  sortOrder: number;
}

export interface Project {
  id: number;
  name: string;
  siteName: string;
  startDate: string;
  endDate: string;
  shareToken: string;
}

export interface ProjectWithProgress extends Project {
  overallProgress: number;
}

export interface ProjectWithWorkItems extends Project {
  workItems: WorkItem[];
}
