"use client"

import { useCallback, useState } from "react"
import { CalendarDays, ChevronDown } from "lucide-react"
import { MonthCalendar } from "./month-calendar"
import { DayPanel } from "./day-panel"
import { useTasks } from "@/hooks/use-tasks"
import { formatDateKey } from "@/lib/planner-types"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function PlannerApp() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false)

  const {
    hydrated,
    getTasksForDate,
    getDatesWithTasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useTasks()

  const dateKey = formatDateKey(selectedDate)
  const dayTasks = getTasksForDate(dateKey)
  const datesWithTasks = getDatesWithTasks()

  const handleSelectDate = useCallback(
    (date: Date) => {
      setSelectedDate(date)
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
      setMobileCalendarOpen(false)
    },
    []
  )

  const handleChangeMonth = useCallback((offset: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev)
      next.setMonth(next.getMonth() + offset)
      return next
    })
  }, [])

  // Mobile week strip
  const weekDays = getWeekDays(selectedDate)

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Planner</h1>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </header>

      {/* Mobile week strip */}
      <div className="flex items-center border-b bg-card md:hidden">
        <div className="flex flex-1 items-center overflow-x-auto px-2 py-2">
          {weekDays.map((d) => {
            const key = formatDateKey(d)
            const isSelected = key === dateKey
            const isToday = key === formatDateKey(new Date())
            const hasTasks = datesWithTasks.has(key)

            return (
              <button
                type="button"
                key={key}
                onClick={() => handleSelectDate(d)}
                className={`relative flex shrink-0 flex-col items-center rounded-lg px-3 py-1.5 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <span className="text-[10px] uppercase">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className={`text-sm font-semibold ${isToday && !isSelected ? "text-primary" : ""}`}>
                  {d.getDate()}
                </span>
                {hasTasks && (
                  <span
                    className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                      isSelected ? "bg-primary-foreground" : "bg-primary"
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Expand calendar button */}
        <Sheet open={mobileCalendarOpen} onOpenChange={setMobileCalendarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 h-8 w-8 shrink-0">
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Open calendar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="px-6 pb-6">
            <SheetHeader>
              <SheetTitle className="sr-only">Calendar</SheetTitle>
            </SheetHeader>
            <MonthCalendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              datesWithTasks={datesWithTasks}
              onSelectDate={handleSelectDate}
              onChangeMonth={handleChangeMonth}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="flex min-h-0 flex-1">
        {/* Desktop sidebar calendar */}
        <aside className="hidden w-72 shrink-0 border-r bg-card p-4 md:block lg:w-80">
          <MonthCalendar
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            datesWithTasks={datesWithTasks}
            onSelectDate={handleSelectDate}
            onChangeMonth={handleChangeMonth}
          />

          {/* Quick stats */}
          <div className="mt-6 rounded-lg bg-muted/50 p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today&apos;s Summary
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <QuickStat label="Total" value={dayTasks.length} />
              <QuickStat
                label="Done"
                value={dayTasks.filter((t) => t.status === "done").length}
              />
              <QuickStat
                label="In Progress"
                value={dayTasks.filter((t) => t.status === "in-progress").length}
              />
              <QuickStat
                label="Not Started"
                value={dayTasks.filter((t) => t.status === "not-started").length}
              />
            </div>
          </div>
        </aside>

        {/* Day panel */}
        <main className="min-h-0 flex-1">
          <DayPanel
            selectedDate={selectedDate}
            tasks={dayTasks}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onAdd={addTask}
          />
        </main>
      </div>
    </div>
  )
}

function QuickStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-card px-2 py-1.5">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  )
}

function getWeekDays(date: Date): Date[] {
  const day = date.getDay()
  const start = new Date(date)
  start.setDate(start.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}
