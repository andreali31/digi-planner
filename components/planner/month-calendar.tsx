"use client"

import { useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDateKey } from "@/lib/planner-types"
import { cn } from "@/lib/utils"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface MonthCalendarProps {
  currentMonth: Date
  selectedDate: Date
  datesWithTasks: Set<string>
  onSelectDate: (date: Date) => void
  onChangeMonth: (offset: number) => void
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function MonthCalendar({
  currentMonth,
  selectedDate,
  datesWithTasks,
  onSelectDate,
  onChangeMonth,
}: MonthCalendarProps) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const today = new Date()
  const todayKey = formatDateKey(today)
  const selectedKey = formatDateKey(selectedDate)

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfWeek(year, month)
    const cells: (Date | null)[] = []

    for (let i = 0; i < firstDay; i++) {
      cells.push(null)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d))
    }
    return cells
  }, [year, month])

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-1 pb-4">
        <h2 className="text-sm font-semibold text-foreground">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onChangeMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onSelectDate(today)}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onChangeMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="pb-2 text-center text-xs font-medium text-muted-foreground"
          >
            {name}
          </div>
        ))}

        {calendarDays.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="aspect-square" />
          }

          const key = formatDateKey(date)
          const isToday = key === todayKey
          const isSelected = key === selectedKey
          const hasTasks = datesWithTasks.has(key)

          return (
            <button
              type="button"
              key={key}
              onClick={() => onSelectDate(date)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors",
                "hover:bg-accent",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                !isSelected && isToday && "font-bold text-primary",
                !isSelected && !isToday && "text-foreground"
              )}
            >
              {date.getDate()}
              {hasTasks && (
                <span
                  className={cn(
                    "absolute bottom-1 h-1 w-1 rounded-full",
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
