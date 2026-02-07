"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { CalendarDays } from "lucide-react"
import type { Task } from "@/lib/planner-types"
import {
  HOURS,
  HOUR_HEIGHT,
  FIRST_HOUR,
  LAST_HOUR,
  formatHour,
  formatDateKey,
  clampHour,
} from "@/lib/planner-types"
import { TimelineBlock } from "./timeline-block"
import { AddTaskDialog } from "./add-task-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface DayPanelProps {
  selectedDate: Date
  tasks: Task[]
  onUpdate: (id: string, updates: Partial<Omit<Task, "id">>) => void
  onDelete: (id: string) => void
  onAdd: (task: Omit<Task, "id" | "order">) => void
}

type DragState = {
  taskId: string
  type: "move" | "resize"
  startY: number
  originalHour: number
  originalDuration: number
}

export function DayPanel({
  selectedDate,
  tasks,
  onUpdate,
  onDelete,
  onAdd,
}: DayPanelProps) {
  const dateKey = formatDateKey(selectedDate)
  const timelineRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [ghostHour, setGhostHour] = useState<number | null>(null)
  const [ghostDuration, setGhostDuration] = useState<number | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragType, setDragType] = useState<"move" | "resize" | null>(null)
  const [clickedHour, setClickedHour] = useState<number | null>(null)

  const dayLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const today = new Date()
  const isToday = formatDateKey(today) === dateKey

  const scheduledTasks = tasks.filter((t) => t.startHour !== null)
  const unscheduledTasks = tasks.filter((t) => t.startHour === null)

  const totalHeight = HOURS.length * HOUR_HEIGHT

  // --- Current time indicator ---
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()
  const showNowLine =
    isToday && currentHour >= FIRST_HOUR && currentHour <= LAST_HOUR
  const nowOffset =
    (currentHour - FIRST_HOUR) * HOUR_HEIGHT +
    (currentMinutes / 60) * HOUR_HEIGHT

  // --- Stable refs for callbacks used in window listeners ---
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate
  const ghostHourRef = useRef(ghostHour)
  ghostHourRef.current = ghostHour
  const ghostDurationRef = useRef(ghostDuration)
  ghostDurationRef.current = ghostDuration

  // --- Window-level pointermove / pointerup for reliable dragging ---
  useEffect(() => {
    if (!draggingId) return

    function onPointerMove(e: PointerEvent) {
      const ds = dragRef.current
      if (!ds) return
      e.preventDefault()

      const deltaY = e.clientY - ds.startY
      const deltaHours = Math.round(deltaY / HOUR_HEIGHT)

      if (ds.type === "move") {
        const newHour = clampHour(
          ds.originalHour + deltaHours,
          ds.originalDuration,
        )
        setGhostHour(newHour)
        setGhostDuration(ds.originalDuration)
      } else {
        // resize
        const newDuration = Math.max(
          1,
          Math.min(
            ds.originalDuration + deltaHours,
            LAST_HOUR - ds.originalHour + 1,
          ),
        )
        setGhostHour(ds.originalHour)
        setGhostDuration(newDuration)
      }
    }

    function onPointerUp() {
      const ds = dragRef.current
      if (!ds) return

      if (ds.type === "move" && ghostHourRef.current !== null) {
        onUpdateRef.current(ds.taskId, { startHour: ghostHourRef.current })
      } else if (ds.type === "resize" && ghostDurationRef.current !== null) {
        onUpdateRef.current(ds.taskId, {
          duration: ghostDurationRef.current,
        })
      }

      dragRef.current = null
      setDraggingId(null)
      setDragType(null)
      setGhostHour(null)
      setGhostDuration(null)
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }
  }, [draggingId])

  // --- Start drag (move or resize) ---
  const startDrag = useCallback(
    (e: React.PointerEvent, task: Task, type: "move" | "resize") => {
      e.preventDefault()
      e.stopPropagation()

      dragRef.current = {
        taskId: task.id,
        type,
        startY: e.clientY,
        originalHour: task.startHour ?? FIRST_HOUR,
        originalDuration: task.duration,
      }
      setDraggingId(task.id)
      setDragType(type)
      setGhostHour(task.startHour ?? FIRST_HOUR)
      setGhostDuration(task.duration)
    },
    [],
  )

  // --- Unscheduled: start drag onto timeline ---
  const startUnscheduledDrag = useCallback(
    (e: React.PointerEvent, task: Task) => {
      e.preventDefault()
      e.stopPropagation()

      dragRef.current = {
        taskId: task.id,
        type: "move",
        startY: e.clientY,
        originalHour: FIRST_HOUR,
        originalDuration: task.duration,
      }
      setDraggingId(task.id)
      setDragType("move")
      setGhostHour(FIRST_HOUR)
      setGhostDuration(task.duration)
    },
    [],
  )

  // --- Click empty slot to add ---
  function handleSlotClick(hour: number) {
    if (dragRef.current) return
    setClickedHour(hour)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Day header */}
      <div className="flex items-center justify-between border-b bg-card px-4 py-3 md:px-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{dayLabel}</h2>
          {isToday && (
            <span className="text-xs font-medium text-primary">Today</span>
          )}
        </div>
        <AddTaskDialog
          dateKey={dateKey}
          onAdd={onAdd}
          defaultHour={clickedHour}
          onOpenChange={(open) => {
            if (!open) setClickedHour(null)
          }}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 py-4 md:px-6">
          {/* Unscheduled tasks tray */}
          {unscheduledTasks.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Unscheduled &mdash; drag onto timeline
              </h3>
              <div className="flex flex-wrap gap-2">
                {unscheduledTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "cursor-grab select-none rounded-lg border bg-card px-3 py-2 text-sm font-medium text-card-foreground shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
                      draggingId === task.id && "opacity-50",
                    )}
                    onPointerDown={(e) => startUnscheduledDrag(e, task)}
                    style={{ touchAction: "none" }}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline grid */}
          <div
            ref={timelineRef}
            className="relative select-none"
            style={{ height: totalHeight }}
          >
            {/* Hour rows / slots */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 flex border-t border-border/40"
                style={{
                  top: (hour - FIRST_HOUR) * HOUR_HEIGHT,
                  height: HOUR_HEIGHT,
                }}
              >
                <div className="w-14 shrink-0 pt-1 pr-2 text-right text-[11px] text-muted-foreground">
                  {formatHour(hour)}
                </div>
                <button
                  type="button"
                  className="flex-1 transition-colors hover:bg-accent/40"
                  onClick={() => handleSlotClick(hour)}
                  aria-label={`Add task at ${formatHour(hour)}`}
                >
                  <span className="sr-only">
                    {"Click to add task at "}
                    {formatHour(hour)}
                  </span>
                </button>
              </div>
            ))}

            {/* Ghost preview while dragging */}
            {draggingId && ghostHour !== null && ghostDuration !== null && (
              <div
                className="pointer-events-none absolute left-14 right-1 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5"
                style={{
                  top: (ghostHour - FIRST_HOUR) * HOUR_HEIGHT + 2,
                  height: ghostDuration * HOUR_HEIGHT - 4,
                  zIndex: 25,
                }}
              />
            )}

            {/* Now line */}
            {showNowLine && (
              <div
                className="pointer-events-none absolute left-14 right-0 z-30 flex items-center"
                style={{ top: nowOffset }}
              >
                <div className="h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-destructive" />
                <div className="h-0.5 flex-1 bg-destructive" />
              </div>
            )}

            {/* Task blocks */}
            {scheduledTasks.map((task) => {
              const isDragging = draggingId === task.id
              const displayHour =
                isDragging && ghostHour !== null ? ghostHour : task.startHour!
              const displayDuration =
                isDragging && dragType === "resize" && ghostDuration !== null
                  ? ghostDuration
                  : isDragging && dragType === "move" && ghostDuration !== null
                    ? ghostDuration
                    : task.duration

              return (
                <TimelineBlock
                  key={task.id}
                  task={task}
                  top={(displayHour - FIRST_HOUR) * HOUR_HEIGHT + 2}
                  height={displayDuration * HOUR_HEIGHT - 4}
                  isDragging={isDragging}
                  onPointerDownMove={(e) => startDrag(e, task, "move")}
                  onPointerDownResize={(e) => startDrag(e, task, "resize")}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              )
            })}
          </div>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No tasks for this day
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Click a time slot or &quot;Add Task&quot; to get started
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
