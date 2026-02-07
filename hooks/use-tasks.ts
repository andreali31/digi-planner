"use client"

import { useCallback, useEffect, useState } from "react"
import type { Task, TaskStatus } from "@/lib/planner-types"
import { generateId } from "@/lib/planner-types"

const STORAGE_KEY = "digital-planner-tasks"

function loadTasks(): Task[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setTasks(loadTasks())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      saveTasks(tasks)
    }
  }, [tasks, hydrated])

  const getTasksForDate = useCallback(
    (dateKey: string) =>
      tasks
        .filter((t) => t.date === dateKey)
        .sort((a, b) => {
          if (a.time && b.time) return a.time.localeCompare(b.time) || a.order - b.order
          if (a.time && !b.time) return -1
          if (!a.time && b.time) return 1
          return a.order - b.order
        }),
    [tasks]
  )

  const getDatesWithTasks = useCallback(() => {
    const dates = new Set<string>()
    for (const t of tasks) {
      dates.add(t.date)
    }
    return dates
  }, [tasks])

  const addTask = useCallback(
    (task: Omit<Task, "id" | "order">) => {
      const existing = tasks.filter((t) => t.date === task.date)
      const newTask: Task = {
        ...task,
        id: generateId(),
        order: existing.length,
      }
      setTasks((prev) => [...prev, newTask])
    },
    [tasks]
  )

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, "id">>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const reorderTasks = useCallback((dateKey: string, reordered: Task[]) => {
    setTasks((prev) => {
      const others = prev.filter((t) => t.date !== dateKey)
      const updated = reordered.map((t, i) => ({ ...t, order: i }))
      return [...others, ...updated]
    })
  }, [])

  return {
    tasks,
    hydrated,
    getTasksForDate,
    getDatesWithTasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
  }
}
