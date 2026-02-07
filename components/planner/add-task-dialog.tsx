"use client"

import React from "react"

import { useState } from "react"
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
import { STATUS_CONFIG } from "@/lib/planner-types"

interface AddTaskDialogProps {
  dateKey: string
  defaultTime?: string | null
  onAdd: (task: Omit<Task, "id" | "order">) => void
}

export function AddTaskDialog({ dateKey, defaultTime, onAdd }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [time, setTime] = useState(defaultTime ?? "")
  const [status, setStatus] = useState<TaskStatus>("not-started")

  function reset() {
    setTitle("")
    setNotes("")
    setTime(defaultTime ?? "")
    setStatus("not-started")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({
      date: dateKey,
      title: title.trim(),
      notes: notes.trim(),
      time: time || null,
      status,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
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
              <label htmlFor="task-title" className="text-sm font-medium text-foreground">
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
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-time" className="text-sm font-medium text-foreground">
                Time <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="task-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-notes" className="text-sm font-medium text-foreground">
                Notes <span className="text-muted-foreground">(optional)</span>
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
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
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
