export type TaskStatus = "not-started" | "in-progress" | "submitted" | "done"

export interface Task {
  id: string
  date: string // YYYY-MM-DD
  title: string
  notes: string
  startHour: number | null // 6-23, null = unscheduled
  duration: number // in hours, min 1, max limited by end of day
  status: TaskStatus
  order: number
}

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  "not-started": {
    label: "Not started",
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-muted-foreground/20",
    dot: "bg-[hsl(var(--status-not-started))]",
  },
  "in-progress": {
    label: "In progress",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-700",
    dot: "bg-[hsl(var(--status-in-progress))]",
  },
  submitted: {
    label: "Submitted",
    color: "text-primary",
    bg: "bg-primary/5",
    border: "border-primary/30",
    dot: "bg-[hsl(var(--status-submitted))]",
  },
  done: {
    label: "Done",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-300 dark:border-emerald-700",
    dot: "bg-[hsl(var(--status-done))]",
  },
}

export const FIRST_HOUR = 6
export const LAST_HOUR = 23
export const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => i + FIRST_HOUR)
export const HOUR_HEIGHT = 72 // px per hour slot

export function formatHour(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM"
  const h = hour % 12 || 12
  return `${h} ${period}`
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function clampHour(hour: number, duration: number): number {
  return Math.max(FIRST_HOUR, Math.min(LAST_HOUR - duration + 1, hour))
}
