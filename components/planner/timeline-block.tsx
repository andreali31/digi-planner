"use client"

import React, { useState } from "react"
import {
  GripVertical,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Task, TaskStatus } from "@/lib/planner-types"
import { STATUS_CONFIG, formatHour } from "@/lib/planner-types"
import { cn } from "@/lib/utils"

interface TimelineBlockProps {
  task: Task
  top: number
  height: number
  isDragging: boolean
  onPointerDownMove: (e: React.PointerEvent) => void
  onPointerDownResize: (e: React.PointerEvent) => void
  onUpdate: (id: string, updates: Partial<Omit<Task, "id">>) => void
  onDelete: (id: string) => void
}

export function TimelineBlock({
  task,
  top,
  height,
  isDragging,
  onPointerDownMove,
  onPointerDownResize,
  onUpdate,
  onDelete,
}: TimelineBlockProps) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editNotes, setEditNotes] = useState(task.notes)

  const config = STATUS_CONFIG[task.status]
  const isDone = task.status === "done"
  const isCompact = height < 56

  function startEdit() {
    setEditTitle(task.title)
    setEditNotes(task.notes)
    setEditing(true)
  }

  function saveEdit() {
    if (!editTitle.trim()) return
    onUpdate(task.id, {
      title: editTitle.trim(),
      notes: editNotes.trim(),
    })
    setEditing(false)
  }

  function cancelEdit() {
    setEditing(false)
  }

  function toggleDone() {
    onUpdate(task.id, { status: isDone ? "not-started" : "done" })
  }

  function changeStatus(status: TaskStatus) {
    onUpdate(task.id, { status })
  }

  // Unschedule: remove from timeline
  function unschedule() {
    onUpdate(task.id, { startHour: null })
  }

  if (editing) {
    return (
      <div
        className="absolute left-14 right-0 z-20 rounded-lg border border-primary/30 bg-card p-3 shadow-lg"
        style={{ top, minHeight: height }}
      >
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
            placeholder="Task title"
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit()
              if (e.key === "Escape") cancelEdit()
            }}
            autoFocus
          />
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
            placeholder="Notes (optional)"
            rows={2}
          />
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEdit}
              className="h-7 px-2"
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
            <Button size="sm" onClick={saveEdit} className="h-7 px-2">
              <Check className="mr-1 h-3 w-3" />
              Save
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group/block absolute left-14 right-1 z-10 flex flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow",
        config.bg,
        config.border,
        isDragging && "z-20 shadow-lg ring-2 ring-primary/30",
        isDone && "opacity-60",
      )}
      style={{ top, height }}
    >
      {/* Drag handle / move area */}
      <div
        className="flex min-h-0 flex-1 cursor-grab items-start gap-1.5 px-2 pt-1.5 pb-5 active:cursor-grabbing"
        onPointerDown={onPointerDownMove}
        style={{ touchAction: "none" }}
      >
        <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />

        <Checkbox
          checked={isDone}
          onCheckedChange={toggleDone}
          className="mt-0.5 shrink-0"
          aria-label={`Mark "${task.title}" as ${isDone ? "not done" : "done"}`}
          onPointerDown={(e) => e.stopPropagation()}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-1">
            <span
              className={cn(
                "truncate text-sm font-medium text-card-foreground",
                isDone && "line-through",
              )}
            >
              {task.title}
            </span>

            {/* Action buttons */}
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/block:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={startEdit}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Edit task"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive hover:text-destructive"
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{task.title}
                      &quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(task.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Details - only show if block is tall enough */}
          {!isCompact && (
            <>
              {task.notes && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {task.notes}
                </p>
              )}
              <div className="mt-1 flex items-center gap-2">
                {task.startHour !== null && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatHour(task.startHour)}
                    {task.duration > 1
                      ? ` - ${formatHour(task.startHour + task.duration)}`
                      : ""}
                  </span>
                )}
                <Select
                  value={task.status}
                  onValueChange={(v) => changeStatus(v as TaskStatus)}
                >
                  <SelectTrigger
                    className={cn(
                      "h-5 w-auto gap-1 border-none px-1.5 py-0 text-[10px]",
                      config.bg,
                      config.color,
                    )}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", config.dot)}
                    />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              STATUS_CONFIG[s].dot,
                            )}
                          />
                          {STATUS_CONFIG[s].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resize handle at the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 flex h-4 cursor-ns-resize items-center justify-center rounded-b-lg transition-colors hover:bg-foreground/5"
        onPointerDown={onPointerDownResize}
        style={{ touchAction: "none" }}
      >
        <div className="h-[3px] w-8 rounded-full bg-muted-foreground/30 transition-colors group-hover/block:bg-muted-foreground/60" />
      </div>
    </div>
  )
}
