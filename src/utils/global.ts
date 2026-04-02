import type { Habit, Milestone } from '../types'

// Calcule le % d'avancement depuis les milestones
export function computeProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0
  const done = milestones.filter(m => m.done).length
  return Math.round((done / milestones.length) * 100)
}

// Génère un id unique simple
export function generateId(): string {
  return crypto.randomUUID()
}

// Vérifie si une habitude a été faite aujourd'hui
export function isDoneToday(habit: Habit): boolean {
  const today = new Date().toISOString().split('T')[0]
  return habit.completedDates.includes(today)
}

// Calcule le streak actuel d'une habitude (jours consécutifs)
export function computeStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0
  const sorted = [...completedDates].sort().reverse()
  let streak = 0
  let current = new Date()

  for (const dateStr of sorted) {
    const date = new Date(dateStr)
    const diff = Math.round(
      (current.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff <= 1) {
      streak++
      current = date
    } else {
      break
    }
  }
  return streak
}