import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Goal, Habit, DailyTask, AppState } from '../types'
import { generateId, computeProgress, computeStreak } from '../utils/global'

interface AppStore extends AppState {
  // Goals
  addGoal: (title: string, description?: string, dueDate?: string) => void
  updateGoalProgress: (goalId: string) => void
  toggleMilestone: (goalId: string, milestoneId: string) => void

  // Habits
  addHabit: (title: string, frequency?: Habit['frequency']) => void
  toggleHabitToday: (habitId: string) => void

  // Daily Tasks
  addDailyTask: (title: string) => void
  toggleDailyTask: (taskId: string) => void
  
  removeGoal: (goalId: string) => void
  removeDailyTask: (taskId: string) => void
  removeHabit: (habitId: string) => void

  updateGoal: (goalId: string, patch: Partial<Pick<Goal, 'title' | 'description' | 'dueDate'>>) => void
  updateHabit: (habitId: string, patch: Partial<Pick<Habit, 'title' | 'frequency'>>) => void
  updateDailyTask: (taskId: string, patch: Partial<Pick<DailyTask, 'title'>>) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      goals: [],
      habits: [],
      dailyTasks: [],

      // Goals
      addGoal: (title, description, dueDate) => {
        const newGoal: Goal = {
          id: generateId(),
          title,
          description,
          status: 'not_started',
          progress: 0,
          milestones: [],
          startDate: new Date().toISOString().split('T')[0],
          dueDate,
          createdAt: new Date().toISOString(),
        }
        set(state => ({ goals: [...state.goals, newGoal] }))
      },

      toggleMilestone: (goalId, milestoneId) => {
        set(state => ({
          goals: state.goals.map(goal => {
            if (goal.id !== goalId) return goal
            const milestones = goal.milestones.map(m =>
              m.id === milestoneId ? { ...m, done: !m.done } : m
            )
            return {
              ...goal,
              milestones,
              progress: computeProgress(milestones),
              status: computeProgress(milestones) === 100 ? 'completed' : 'in_progress',
            }
          }),
        }))
      },

      updateGoalProgress: (goalId) => {
        const goal = get().goals.find(g => g.id === goalId)
        if (!goal) return
        set(state => ({
          goals: state.goals.map(g =>
            g.id === goalId
              ? { ...g, progress: computeProgress(g.milestones) }
              : g
          ),
        }))
      },

      // Habits
      addHabit: (title, frequency = 'daily') => {
        const newHabit: Habit = {
          id: generateId(),
          title,
          frequency,
          completedDates: [],
          streak: 0,
          bestStreak: 0,
          createdAt: new Date().toISOString(),
        }
        set(state => ({ habits: [...state.habits, newHabit] }))
      },

      toggleHabitToday: (habitId) => {
        const today = new Date().toISOString().split('T')[0]
        set(state => ({
          habits: state.habits.map(habit => {
            if (habit.id !== habitId) return habit
            const alreadyDone = habit.completedDates.includes(today)
            const completedDates = alreadyDone
              ? habit.completedDates.filter(d => d !== today)
              : [...habit.completedDates, today]
            const streak = computeStreak(completedDates)
            return {
              ...habit,
              completedDates,
              streak,
              bestStreak: Math.max(streak, habit.bestStreak),
            }
          }),
        }))
      },

      // Daily Tasks
      addDailyTask: (title) => {
        const newTask: DailyTask = {
          id: generateId(),
          title,
          done: false,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        }
        set(state => ({ dailyTasks: [...state.dailyTasks, newTask] }))
      },

      toggleDailyTask: (taskId) => {
        set(state => ({
          dailyTasks: state.dailyTasks.map(task =>
            task.id === taskId ? { ...task, done: !task.done } : task
          ),
        }))
      },

      removeGoal: (goalId) => {
        set(state => ({ goals: state.goals.filter(g => g.id !== goalId) }))
    },
    
    removeDailyTask: (taskId) => {
        set(state => ({ dailyTasks: state.dailyTasks.filter(t => t.id !== taskId) }))
    },
    removeHabit: (habitId) => {
        set(state => ({ habits: state.habits.filter(h => h.id !== habitId) }))
    },
    updateGoal: (goalId, patch) => {
        set(state => ({
    goals: state.goals.map(g => g.id === goalId ? { ...g, ...patch } : g)}))
    },
    updateHabit: (habitId, patch) => {
        set(state => ({
    habits: state.habits.map(h => h.id === habitId ? { ...h, ...patch } : h)}))
    },
    updateDailyTask: (taskId, patch) => {
        set(state => ({
    dailyTasks: state.dailyTasks.map(t => t.id === taskId ? { ...t, ...patch } : t)}))
    },
    }),
    {
      name: 'goals-tracker-storage', // clé dans localStorage
    }
  )

  
)