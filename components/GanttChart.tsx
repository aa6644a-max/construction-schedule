"use client";

import { useMemo, useState, useRef } from "react";
import { WorkItem, Project } from "@/types/models";
import { ViewUnit, calcCols, colWidth, colLabel, dateToX } from "@/lib/ganttMath";

interface Props {
  project: Project;
  workItems: WorkItem[];
  readonly?: boolean;
  onProgressUpdate?: (id: number, progress: number) => void;
}

const LEFT_PANEL_WIDTH = 440;
const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 64;

export default function GanttChart({ project, workItems, readonly = false, onProgressUpdate }: Props) {
  const [viewUnit, setViewUnit] = useState<ViewUnit>("week");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [editProgress, setEditProgress] = useState<{ id: number; value: string } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const projectStart = new Date(project.startDate);
  const projectEnd = new Date(project.endDate);
  const today = new Date();

  const cols = useMemo(
    () => calcCols(projectStart, projectEnd, viewUnit),
    [viewUnit, project.startDate, project.endDate]
  );

  const cw = colWidth(viewUnit);
  const totalWidth = cols.length * cw;
  const todayX = dateToX(today, cols, viewUnit, cw);

  const categories = workItems.filter((w) => w.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);

  const visibleRows: WorkItem[] = [];
  for (const cat of categories) {
    visibleRows.push(cat);
    if (!collapsed.has(cat.id)) {
      const children = workItems
        .filter((w) => w.parentId === cat.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      visibleRows.push(...children);
    }
  }

  const catItems = workItems.filter((w) => w.parentId === null);
  const overallProgress = Math.round(
    catItems.reduce((sum, cat) => {
      const children = workItems.filter((w) => w.parentId === cat.id);
      if (children.length === 0) return sum;
      const relTotal = children.reduce((s, w) => s + w.weight, 0);
      if (relTotal === 0) return sum;
      const catProgress = children.reduce((s, w) => s + w.actualProgress * (w.weight / relTotal), 0);
      return sum + cat.weight * catProgress;
    }, 0)
  );

  function toggleCollapse(id: number) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function barProps(item: WorkItem) {
    if (!item.plannedStart || !item.plannedEnd) return null;
    const sx = dateToX(new Date(item.plannedStart), cols, viewUnit, cw);
    const ex = dateToX(new Date(item.plannedEnd), cols, viewUnit, cw);
    if (sx < 0 || ex < 0) return null;
    const width = Math.max(ex - sx + cw, 4);
    const actualWidth = (item.actualProgress / 100) * width;
    return { sx, width, actualWidth };
  }

  function saveProgress(id: number, value: string) {
    const num = Math.min(100, Math.max(0, Number(value)));
    if (!isNaN(num) && onProgressUpdate) {
      onProgressUpdate(id, num);
    }
    setEditProgress(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-gray-600">전체 진행률</span>
          <div className="flex items-center gap-3">
            <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-base font-bold text-blue-600">{overallProgress}%</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {(["day", "week", "month"] as ViewUnit[]).map((u) => (
            <button
              key={u}
              onClick={() => setViewUnit(u)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewUnit === u ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {u === "day" ? "일" : u === "week" ? "주" : "월"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div className="flex overflow-hidden" style={{ height: `${HEADER_HEIGHT + visibleRows.length * ROW_HEIGHT}px` }}>
        {/* Left panel */}
        <div
          className="flex-shrink-0 border-r border-gray-200 overflow-hidden"
          style={{ width: LEFT_PANEL_WIDTH }}
        >
          {/* Header */}
          <div
            className="flex items-center border-b border-gray-200 bg-gray-50 px-3 gap-2"
            style={{ height: HEADER_HEIGHT }}
          >
            <span className="text-sm font-semibold text-gray-500 w-20">코드</span>
            <span className="text-sm font-semibold text-gray-500 flex-1">공종명</span>
            <span className="text-sm font-semibold text-gray-500 w-14 text-right">비율</span>
            <span className="text-sm font-semibold text-gray-500 w-16 text-right">실적%</span>
          </div>

          {/* Rows */}
          {visibleRows.map((item) => {
            const isCategory = item.parentId === null;
            const isCollapsed = collapsed.has(item.id);
            const childCount = workItems.filter((w) => w.parentId === item.id).length;

            return (
              <div
                key={item.id}
                className={`flex items-center px-3 gap-2 border-b border-gray-100 ${
                  isCategory ? "bg-gray-50" : "bg-white"
                }`}
                style={{ height: ROW_HEIGHT }}
              >
                <span className={`text-sm text-gray-400 w-20 truncate ${isCategory ? "font-semibold" : ""}`}>
                  {item.code}
                </span>
                <div
                  className={`flex-1 flex items-center gap-1 min-w-0 ${isCategory ? "cursor-pointer" : "pl-4"}`}
                  onClick={() => isCategory && toggleCollapse(item.id)}
                >
                  {isCategory && childCount > 0 && (
                    <span className="text-gray-400 text-sm">{isCollapsed ? "▶" : "▼"}</span>
                  )}
                  <span className={`text-sm truncate ${isCategory ? "font-semibold text-gray-700" : "text-gray-600"}`}>
                    {item.name}
                  </span>
                </div>
                <span className="text-sm text-gray-400 w-14 text-right">
                  {isCategory ? "" : `${(item.weight * 100).toFixed(1)}%`}
                </span>
                <div className="w-16 text-right">
                  {!isCategory && (
                    readonly ? (
                      <span className="text-sm text-red-500 font-medium">{item.actualProgress}%</span>
                    ) : editProgress?.id === item.id ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editProgress.value}
                        onChange={(e) => setEditProgress({ id: item.id, value: e.target.value })}
                        onBlur={(e) => saveProgress(item.id, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveProgress(item.id, editProgress.value)}
                        className="w-16 text-sm text-right border border-blue-300 rounded px-1 py-0.5 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="text-sm text-red-500 font-medium cursor-pointer hover:underline"
                        onClick={() => setEditProgress({ id: item.id, value: String(item.actualProgress) })}
                      >
                        {item.actualProgress}%
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline panel */}
        <div ref={timelineRef} className="flex-1 overflow-x-auto overflow-y-hidden">
          <div style={{ width: totalWidth, minWidth: "100%" }}>
            {/* Timeline header */}
            <div
              className="flex border-b border-gray-200 bg-gray-50 relative"
              style={{ height: HEADER_HEIGHT }}
            >
              {cols.map((col, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex items-center justify-center border-r border-gray-100 text-sm text-gray-500"
                  style={{ width: cw, height: HEADER_HEIGHT }}
                >
                  {colLabel(col, viewUnit)}
                </div>
              ))}
            </div>

            {/* Gantt rows */}
            <div className="relative">
              {/* Today line */}
              {todayX >= 0 && (
                <div
                  className="absolute top-0 bottom-0 border-l-2 border-red-400 border-dashed z-10 pointer-events-none"
                  style={{ left: todayX + cw / 2 }}
                />
              )}

              {visibleRows.map((item) => {
                const bars = barProps(item);
                const isCategory = item.parentId === null;

                return (
                  <div
                    key={item.id}
                    className={`relative border-b border-gray-100 ${isCategory ? "bg-gray-50" : "bg-white"}`}
                    style={{ height: ROW_HEIGHT, width: totalWidth }}
                  >
                    {/* Column grid lines */}
                    {cols.map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-r border-gray-50"
                        style={{ left: i * cw, width: cw }}
                      />
                    ))}

                    {/* Planned bar (blue) */}
                    {bars && !isCategory && (
                      <div
                        className="absolute rounded bg-blue-300 opacity-80"
                        style={{
                          left: bars.sx,
                          width: bars.width,
                          top: 13,
                          height: 22,
                        }}
                      />
                    )}

                    {/* Actual bar (red) */}
                    {bars && !isCategory && bars.actualWidth > 0 && (
                      <div
                        className="absolute rounded bg-red-400 opacity-90"
                        style={{
                          left: bars.sx,
                          width: bars.actualWidth,
                          top: 13,
                          height: 22,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-blue-300 rounded-sm opacity-80" />
          <span>예정공정</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-red-400 rounded-sm opacity-90" />
          <span>실적공정</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 border-l-2 border-red-400 border-dashed h-3" />
          <span>오늘</span>
        </div>
      </div>
    </div>
  );
}
