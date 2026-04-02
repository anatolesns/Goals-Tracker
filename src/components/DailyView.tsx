import { useState } from 'react'
import { useAppStore } from '../store/UseAppStore'
import { useTheme } from '../theme'
import AddItemModal from './AddItemModal'
import EditModal from './EditModal'
import type { Habit, DailyTask } from '../types'

function getWeekKey(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay() + 1) // lundi
  return d.toISOString().split('T')[0]
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function isHabitDone(habit: Habit, today: string): boolean {
  if (habit.frequency === 'daily') {
    return habit.completedDates.includes(today)
  }
  if (habit.frequency === 'weekly') {
    const thisWeek = getWeekKey(new Date())
    return habit.completedDates.some(d => getWeekKey(new Date(d)) === thisWeek)
  }
  // monthly
  const thisMonth = getMonthKey(new Date())
  return habit.completedDates.some(d => getMonthKey(new Date(d)) === thisMonth)
}

// Violet family: distinguishable within the daily (violet) theme
const FREQ_CONFIG = {
  daily:   { label: 'Quotidiennes',  streakUnit: 'j',    color: 'bg-violet-500 border-violet-500', ring: 'group-hover:border-violet-400',  dot: 'bg-violet-400' },
  weekly:  { label: 'Hebdomadaires', streakUnit: 'sem',  color: 'bg-purple-500 border-purple-500', ring: 'group-hover:border-purple-400',  dot: 'bg-purple-400' },
  monthly: { label: 'Mensuelles',    streakUnit: 'mois', color: 'bg-fuchsia-500 border-fuchsia-500', ring: 'group-hover:border-fuchsia-400', dot: 'bg-fuchsia-400' },
}

interface HabitListProps {
  habits: Habit[]
  today: string
  toggleHabitToday: (id: string) => void
  removeHabit: (id: string) => void
  setEditTarget: (t: { type: 'habit'; item: Habit }) => void
  frequency: 'daily' | 'weekly' | 'monthly'
}

function HabitList({ habits, today, toggleHabitToday, removeHabit, setEditTarget, frequency }: HabitListProps) {
  const cfg = FREQ_CONFIG[frequency]
  if (habits.length === 0) {
    return <p className="text-gray-400 text-sm italic">Aucune habitude {cfg.label.toLowerCase()}</p>
  }
  return (
    <ul className="space-y-2">
      {habits.map(habit => {
        const done = isHabitDone(habit, today)
        return (
          <li key={habit.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-violet-200 transition-colors duration-100 group">
            <div onClick={() => toggleHabitToday(habit.id)} className="flex items-center gap-3 flex-1 cursor-pointer">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-100
                ${done ? cfg.color : `border-gray-300 ${cfg.ring}`}`}>
                {done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              </div>
              <span className={`${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{habit.title}</span>
            </div>
            <div className="flex items-center gap-2">
              {habit.streak > 0 && (
                <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                  🔥 {habit.streak}{cfg.streakUnit}
                </span>
              )}
              <button
                onClick={() => setEditTarget({ type: 'habit', item: habit })}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-violet-400 hover:bg-violet-50 rounded-lg transition-colors duration-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                onClick={() => { if (confirm(`Supprimer "${habit.title}" ?`)) removeHabit(habit.id) }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors duration-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function DailyView({ onGoToGoal }: { onGoToGoal: (goalId: string) => void }) {
  const { dailyTasks, habits, goals, toggleDailyTask, toggleHabitToday, removeDailyTask, removeHabit } = useAppStore()
  const [modal, setModal] = useState<'task' | 'habit' | null>(null)
  const [editTarget, setEditTarget] = useState<{ type: 'habit'; item: Habit } | { type: 'task'; item: DailyTask } | null>(null)
  const t = useTheme()

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = dailyTasks.filter(t => t.date === today)
  const doneTasks = todayTasks.filter(t => t.done).length
  const doneHabits = habits.filter(h => isHabitDone(h, today)).length
  const goalsToday = goals.filter(g => g.dueDate === today && g.status !== 'completed')

  const dailyHabits = habits.filter(h => h.frequency === 'daily')
  const weeklyHabits = habits.filter(h => h.frequency === 'weekly')
  const monthlyHabits = habits.filter(h => h.frequency === 'monthly')

  return (
    <div className="space-y-8">
      {/* Header du jour */}
      <div>
        <p className="text-sm text-gray-400 mb-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h2 className="text-2xl font-semibold text-gray-800">Aujourd'hui</h2>
        <div className="flex gap-4 mt-3">
          <span className="text-sm text-gray-500">{doneTasks}/{todayTasks.length} tâches</span>
          <span className="text-sm text-gray-500">{doneHabits}/{habits.length} habitudes</span>
        </div>
      </div>

      {/* Objectifs à rendre aujourd'hui */}
      {goalsToday.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Objectifs du jour</h3>
            <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
              {goalsToday.length} à terminer
            </span>
          </div>
          <ul className="space-y-2">
            {goalsToday.map(goal => (
              <li
                key={goal.id}
                onClick={() => onGoToGoal(goal.id)}
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl cursor-pointer hover:bg-red-100 hover:border-red-300 transition-colors duration-100 group"
              >
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{goal.title}</p>
                  {goal.description && <p className="text-xs text-gray-500 truncate">{goal.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-xs text-gray-500">{goal.progress}%</div>
                  <div className="w-16 h-1.5 bg-red-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <svg className="w-4 h-4 text-red-300 group-hover:text-red-500 transition-colors duration-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tâches du jour */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tâches</h3>
          <button onClick={() => setModal('task')} className={`text-sm font-medium ${t.accentText}`}>+ Ajouter une tâche</button>
        </div>
        {todayTasks.length === 0 ? (
          <p className="text-gray-400 text-sm italic">Aucune tâche pour aujourd'hui</p>
        ) : (
          <ul className="space-y-2">
            {todayTasks.map(task => (
              <li key={task.id} className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 ${t.cardHover} transition group`}>
                <div onClick={() => toggleDailyTask(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition
                    ${task.done ? t.checkDone : `border-gray-300 ${t.checkHover}`}`}>
                  {task.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                </div>
                <span onClick={() => toggleDailyTask(task.id)}
                  className={`flex-1 cursor-pointer ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {task.title}
                </span>
                <button
                  onClick={() => setEditTarget({ type: 'task', item: task })}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-violet-400 hover:bg-violet-50 rounded-lg transition-colors duration-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  onClick={() => removeDailyTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors duration-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Habitudes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Habitudes</h3>
          <button onClick={() => setModal('habit')} className={`text-sm font-medium ${t.accentText}`}>+ Ajouter une habitude</button>
        </div>

        {habits.length === 0 ? (
          <p className="text-gray-400 text-sm italic">Aucune habitude configurée</p>
        ) : (
          <div className="space-y-6">
            {/* Quotidiennes */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${FREQ_CONFIG.daily.dot} inline-block`} />
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quotidiennes</h4>
                <span className="text-xs text-gray-300">
                  {dailyHabits.filter(h => isHabitDone(h, today)).length}/{dailyHabits.length}
                </span>
              </div>
              <HabitList habits={dailyHabits} today={today} toggleHabitToday={toggleHabitToday} removeHabit={removeHabit} setEditTarget={t => setEditTarget(t)} frequency="daily" />
            </div>

            {/* Hebdomadaires */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${FREQ_CONFIG.weekly.dot} inline-block`} />
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hebdomadaires</h4>
                <span className="text-xs text-gray-300">
                  {weeklyHabits.filter(h => isHabitDone(h, today)).length}/{weeklyHabits.length}
                </span>
              </div>
              <HabitList habits={weeklyHabits} today={today} toggleHabitToday={toggleHabitToday} removeHabit={removeHabit} setEditTarget={t => setEditTarget(t)} frequency="weekly" />
            </div>

            {/* Mensuelles */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${FREQ_CONFIG.monthly.dot} inline-block`} />
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mensuelles</h4>
                <span className="text-xs text-gray-300">
                  {monthlyHabits.filter(h => isHabitDone(h, today)).length}/{monthlyHabits.length}
                </span>
              </div>
              <HabitList habits={monthlyHabits} today={today} toggleHabitToday={toggleHabitToday} removeHabit={removeHabit} setEditTarget={t => setEditTarget(t)} frequency="monthly" />
            </div>
          </div>
        )}
      </section>

      {modal && <AddItemModal type={modal} onClose={() => setModal(null)} />}
      {editTarget && (
        <EditModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
