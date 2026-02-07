"use client"

import React, { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Task, TaskStatus } from "@/lib/planner-types"
import { STATUS_CONFIG, HOURS, formatHour } from "@/lib/planner-types"

interface AddTaskDialogProps {
  dateKey: string
  defaultHour?: number | null
  onAdd: (task: Omit<Task, "id" | "order">) => void
  onOpenChange?: (open: boolean) => void
}

export function AddTaskDialog({
  dateKey,
  defaultHour,
  onAdd,
  onOpenChange,
}: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [hour, setHour] = useState<string>(
    defaultHour !== null && defaultHour !== undefined
      ? String(defaultHour)
      : "none",
  )
  const [duration, setDuration] = useState("1")
  const [status, setStatus] = useState<TaskStatus>("not-started")

  // Open dialog when a slot is clicked
  useEffect(() => {
    if (defaultHour !== null && defaultHour !== undefined) {
      setHour(String(defaultHour))
      setOpen(true)
    }
  }, [defaultHour])

  function reset() {
    setTitle("")
    setNotes("")
    setHour("none")
    setDuration("1")
    setStatus("not-started")
  }

  function handleOpenChange(v: boolean) {
    setOpen(v)
    if (!v) {
      reset()
      onOpenChange?.(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({
      date: dateKey,
      title: title.trim(),
      notes: notes.trim(),
      startHour: hour === "none" ? null : Number(hour),
      duration: Number(duration),
      status,
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="task-title"
                className="text-sm font-medium text-foreground"
              >
                Title
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Start Time
                </label>
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unscheduled" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unscheduled</SelectItem>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {formatHour(h)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-28 flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Duration
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d} {d === 1 ? "hour" : "hours"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="task-notes"
                className="text-sm font-medium text-foreground"
              >
                Notes{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="task-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="Any additional details..."
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!title.trim()}>
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
