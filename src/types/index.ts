//  Types de base 

export type Frequency = 'daily' | 'weekly' | 'monthly'

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned'

//  Tâche quotidienne (ponctuelle) 

export interface DailyTask {
  id: string
  title: string
  done: boolean
  date: string          // format ISO : "2026-03-30"
  createdAt: string
}

//  Habitude récurrente 

export interface Habit {
  id: string
  title: string
  frequency: Frequency
  completedDates: string[]  // dates où l'habitude a été faite
  streak: number            // jours consécutifs actuels
  bestStreak: number
  createdAt: string
  color?: string            // pour la UI
}

//  Sous-étape d'un objectif long terme 

export interface Milestone {
  id: string
  title: string
  done: boolean
  dueDate?: string
}

//  Objectif long terme 

export interface Goal {
  id: string
  title: string
  description?: string
  status: GoalStatus
  progress: number          // 0 à 100 (calculé depuis les milestones)
  milestones: Milestone[]
  startDate: string
  dueDate?: string
  createdAt: string
  category?: string         // ex: "santé", "travail", "perso"
  color?: string
}

//  État global de l'app 

export interface AppState {
  goals: Goal[]
  habits: Habit[]
  dailyTasks: DailyTask[]
}