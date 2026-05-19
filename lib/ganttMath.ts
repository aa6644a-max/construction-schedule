export type ViewUnit = "day" | "week" | "month";

export function getDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function getWeeks(start: Date, end: Date): Date[] {
  const weeks: Date[] = [];
  const cur = new Date(start);
  cur.setDate(cur.getDate() - cur.getDay() + 1);
  while (cur <= end) {
    weeks.push(new Date(cur));
    cur.setDate(cur.getDate() + 7);
  }
  return weeks;
}

export function getMonths(start: Date, end: Date): Date[] {
  const months: Date[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

export function colWidth(unit: ViewUnit): number {
  if (unit === "day") return 28;
  if (unit === "week") return 60;
  return 80;
}

export function colLabel(date: Date, unit: ViewUnit): string {
  if (unit === "day") return String(date.getDate());
  if (unit === "week") {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${m}/${d}`;
  }
  return `${date.getMonth() + 1}월`;
}

export function dateToX(date: Date, cols: Date[], unit: ViewUnit, cw: number): number {
  const d = new Date(date);
  if (unit === "day") {
    const idx = cols.findIndex(
      (c) =>
        c.getFullYear() === d.getFullYear() &&
        c.getMonth() === d.getMonth() &&
        c.getDate() === d.getDate()
    );
    return idx >= 0 ? idx * cw : -1;
  }
  if (unit === "week") {
    for (let i = 0; i < cols.length; i++) {
      const next = cols[i + 1] ?? new Date(cols[i].getTime() + 7 * 86400000);
      if (d >= cols[i] && d < next) {
        const frac = (d.getTime() - cols[i].getTime()) / (next.getTime() - cols[i].getTime());
        return i * cw + frac * cw;
      }
    }
  }
  if (unit === "month") {
    for (let i = 0; i < cols.length; i++) {
      const nextMonth = new Date(cols[i].getFullYear(), cols[i].getMonth() + 1, 1);
      if (d >= cols[i] && d < nextMonth) {
        const frac = (d.getTime() - cols[i].getTime()) / (nextMonth.getTime() - cols[i].getTime());
        return i * cw + frac * cw;
      }
    }
  }
  return -1;
}

export function calcCols(start: Date, end: Date, unit: ViewUnit): Date[] {
  if (unit === "day") return getDays(start, end);
  if (unit === "week") return getWeeks(start, end);
  return getMonths(start, end);
}
