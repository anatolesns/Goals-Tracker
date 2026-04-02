import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/UseAppStore'
import type { Goal, Habit, DailyTask } from '../types'

export function useSync(userId: string) {
  const { goals, habits, dailyTasks } = useAppStore()

  // Charger les données depuis Supabase au démarrage
  useEffect(() => {
    const load = async () => {
      const [g, h, t] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('habits').select('*').eq('user_id', userId),
        supabase.from('daily_tasks').select('*').eq('user_id', userId),
      ])

      if (g.data) useAppStore.setState({
        goals: g.data.map(row => ({
          ...row,
          startDate: row.start_date,
          dueDate: row.due_date,
          createdAt: row.created_at,
        })) as Goal[]
      })

      if (h.data) useAppStore.setState({
        habits: h.data.map(row => ({
          ...row,
          completedDates: row.completed_dates,
          bestStreak: row.best_streak,
          createdAt: row.created_at,
        })) as Habit[]
      })

      if (t.data) useAppStore.setState({
        dailyTasks: t.data.map(row => ({
          ...row,
          createdAt: row.created_at,
        })) as DailyTask[]
      })
    }

    load()
  }, [userId])

  // Sauvegarder automatiquement quand les données changent
  useEffect(() => {
    if (!goals.length) return
    const upsert = goals.map(g => ({
      id: g.id,
      user_id: userId,
      title: g.title,
      description: g.description,
      status: g.status,
      progress: g.progress,
      milestones: g.milestones,
      start_date: g.startDate,
      due_date: g.dueDate,
      category: g.category,
      color: g.color,
      created_at: g.createdAt,
    }))
    supabase.from('goals').upsert(upsert).then()
  }, [goals, userId])

  useEffect(() => {
    if (!habits.length) return
    const upsert = habits.map(h => ({
      id: h.id,
      user_id: userId,
      title: h.title,
      frequency: h.frequency,
      completed_dates: h.completedDates,
      streak: h.streak,
      best_streak: h.bestStreak,
      color: h.color,
      created_at: h.createdAt,
    }))
    supabase.from('habits').upsert(upsert).then()
  }, [habits, userId])

  useEffect(() => {
    if (!dailyTasks.length) return
    const upsert = dailyTasks.map(t => ({
      id: t.id,
      user_id: userId,
      title: t.title,
      done: t.done,
      date: t.date,
      created_at: t.createdAt,
    }))
    supabase.from('daily_tasks').upsert(upsert).then()
  }, [dailyTasks, userId])
}