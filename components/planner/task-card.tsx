"use client"

import { useState } from "react"
import { GripVertical, Pencil, Trash2, Check, X } from "lucide-react"
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

interface TaskCardProps {
  task: Task
  onUpdate: (id: string, updates: Partial<Omit<Task, "id">>) => void
  onDelete: (id: string) => void
  dragHandleProps?: Record<string, unknown>
}

export function TaskCard({ task, onUpdate, onDelete, dragHandleProps }: TaskCardProps) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editTime, setEditTime] = useState(task.time ?? "")
  const [editNotes, setEditNotes] = useState(task.notes)

  const config = STATUS_CONFIG[task.status]
  const isDone = task.status === "done"

  function startEdit() {
    setEditTitle(task.title)
    setEditTime(task.time ?? "")
    setEditNotes(task.notes)
    setEditing(true)
  }

  function saveEdit() {
    if (!editTitle.trim()) return
    onUpdate(task.id, {
      title: editTitle.trim(),
      time: editTime || null,
      notes: editNotes.trim(),
    })
    setEditing(false)
  }

  function cancelEdit() {
    setEditing(false)
  }

  function toggleDone() {
    onUpdate(task.id, {
      status: isDone ? "not-started" : "done",
    })
  }

  function changeStatus(status: TaskStatus) {
    onUpdate(task.id, { status })
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-primary/30 bg-card p-3 shadow-sm">
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
          <input
            type="time"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
          />
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
            placeholder="Notes (optional)"
            rows={2}
          />
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7 px-2">
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
        "group rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md",
        isDone && "opacity-60"
      )}
    >
      <div className="flex items-start gap-2">
        <div
          {...dragHandleProps}
          className="mt-0.5 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <Checkbox
          checked={isDone}
          onCheckedChange={toggleDone}
          className="mt-0.5"
          aria-label={`Mark "${task.title}" as ${isDone ? "not done" : "done"}`}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                "text-sm font-medium text-card-foreground",
                isDone && "line-through"
              )}
            >
              {task.title}
            </span>
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={startEdit}
                aria-label="Edit task"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{task.title}&quot;? This action
                      cannot be undone.
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

          {task.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2">{task.notes}</p>
          )}

          <div className="flex items-center gap-2 pt-0.5">
            {task.time && (
              <span className="text-xs text-muted-foreground">
                {formatHour(parseInt(task.time.split(":")[0]))}
                {task.time.split(":")[1] !== "00" ? `:${task.time.split(":")[1]}` : ""}
              </span>
            )}
            <Select value={task.status} onValueChange={(v) => changeStatus(v as TaskStatus)}>
              <SelectTrigger
                className={cn(
                  "h-6 w-auto gap-1 border-none px-2 py-0 text-xs",
                  config.bg,
                  config.color
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", STATUS_CONFIG[s].dot)}
                      />
                      {STATUS_CONFIG[s].label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
