"use client"

import React from "react"

import { useCallback, useRef, useState } from "react"
import { CalendarDays } from "lucide-react"
import type { Task } from "@/lib/planner-types"
import { HOURS, formatHour, formatDateKey } from "@/lib/planner-types"
import { TaskCard } from "./task-card"
import { AddTaskDialog } from "./add-task-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface DayPanelProps {
  selectedDate: Date
  tasks: Task[]
  onUpdate: (id: string, updates: Partial<Omit<Task, "id">>) => void
  onDelete: (id: string) => void
  onAdd: (task: Omit<Task, "id" | "order">) => void
  onReorder: (dateKey: string, reordered: Task[]) => void
}

export function DayPanel({
  selectedDate,
  tasks,
  onUpdate,
  onDelete,
  onAdd,
  onReorder,
}: DayPanelProps) {
  const dateKey = formatDateKey(selectedDate)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)
  const [dragging, setDragging] = useState(false)

  const dayLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const today = new Date()
  const isToday = formatDateKey(today) === dateKey

  // Group tasks: timed tasks go into their hour slots, untimed go into a separate list
  const timedTasks = tasks.filter((t) => t.time !== null)
  const untimedTasks = tasks.filter((t) => t.time === null)

  // Group timed tasks by hour
  const tasksByHour: Record<number, Task[]> = {}
  for (const t of timedTasks) {
    const hour = parseInt(t.time!.split(":")[0])
    if (!tasksByHour[hour]) tasksByHour[hour] = []
    tasksByHour[hour].push(t)
  }

  const handleDragStart = useCallback((index: number) => {
    dragItem.current = index
    setDragging(true)
  }, [])

  const handleDragEnter = useCallback((index: number) => {
    dragOverItem.current = index
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null) {
      setDragging(false)
      return
    }
    const reordered = [...tasks]
    const [dragged] = reordered.splice(dragItem.current, 1)
    reordered.splice(dragOverItem.current, 0, dragged)
    onReorder(dateKey, reordered)
    dragItem.current = null
    dragOverItem.current = null
    setDragging(false)
  }, [tasks, dateKey, onReorder])

  return (
    <div className="flex h-full flex-col">
      {/* Day header */}
      <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{dayLabel}</h2>
          {isToday && (
            <span className="text-xs font-medium text-primary">Today</span>
          )}
        </div>
        <AddTaskDialog dateKey={dateKey} onAdd={onAdd} />
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 py-4 md:px-6">
          {/* Untimed tasks section */}
          {untimedTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                All Day
              </h3>
              <div className="flex flex-col gap-2">
                {untimedTasks.map((task, idx) => {
                  const globalIdx = tasks.indexOf(task)
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(globalIdx)}
                      onDragEnter={() => handleDragEnter(globalIdx)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={cn(
                        "transition-transform",
                        dragging && "cursor-grabbing"
                      )}
                    >
                      <TaskCard
                        task={task}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        dragHandleProps={{
                          onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            {HOURS.map((hour) => {
              const hourTasks = tasksByHour[hour] || []
              const paddedHour = String(hour).padStart(2, "0")

              return (
                <div
                  key={hour}
                  className="group/hour relative flex min-h-[4rem] border-t border-border/50"
                >
                  <div className="w-16 shrink-0 py-2 pr-3 text-right text-xs text-muted-foreground">
                    {formatHour(hour)}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 py-1.5">
                    {hourTasks.map((task) => {
                      const globalIdx = tasks.indexOf(task)
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(globalIdx)}
                          onDragEnter={() => handleDragEnter(globalIdx)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => e.preventDefault()}
                          className={cn(
                            "transition-transform",
                            dragging && "cursor-grabbing"
                          )}
                        >
                          <TaskCard
                            task={task}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            dragHandleProps={{
                              onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No tasks for this day</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Click &quot;Add Task&quot; to get started
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
