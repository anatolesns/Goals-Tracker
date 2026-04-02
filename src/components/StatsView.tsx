import { useMemo, useState } from 'react'
import { useAppStore } from '../store/UseAppStore'
import { useTheme } from '../theme'
import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'
import { format, subDays, eachDayOfInterval, subWeeks, subMonths, startOfWeek, startOfMonth, eachMonthOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Habit } from '../types'

//  Helpers 

function getWeekKey(date: Date) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}
function getMonthKey(date: Date) {
  return format(date, 'yyyy-MM')
}
const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

//  Vue "Toutes les habitudes" sur 14 jours 

function AllHabitsView() {
  const { habits } = useAppStore()
  const t = useTheme()
  const today = new Date().toISOString().split('T')[0]

  const data = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i)
      const str = format(date, 'yyyy-MM-dd')
      const done = habits.filter(h => h.completedDates.includes(str)).length
      return {
        label: format(date, 'EEE d', { locale: fr }),
        done,
        isToday: str === today,
      }
    })
  }, [habits])

  const totalHabits = habits.length
  if (totalHabits === 0) return <p className="text-sm text-gray-400 italic text-center py-4">Aucune habitude enregistrée</p>

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">Habitudes complétées chaque jour — 14 derniers jours</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={18}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={20} allowDecimals={false} domain={[0, totalHabits]} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 13 }}
            cursor={{ fill: `${t.chartPrimary}12` }}
            formatter={(v: number) => [`${v} / ${totalHabits} habitudes`, '']}
          />
          <Bar dataKey="done" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.isToday ? t.chartPrimary : `${t.chartPrimary}80`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

//  Vue quotidienne : 2 semaines 

function DailyHabitView({ habit }: { habit: Habit }) {
  const t = useTheme()

  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i)
      const str = format(date, 'yyyy-MM-dd')
      return {
        date: str,
        dayLetter: DAY_LETTERS[date.getDay()],
        dayNum: format(date, 'd'),
        done: habit.completedDates.includes(str),
        isToday: i === 13,
      }
    })
  }, [habit])

  const week1 = days.slice(0, 7)
  const week2 = days.slice(7)
  const doneCount = days.filter(d => d.done).length
  const last7Done = week2.filter(d => d.done).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Série actuelle', value: habit.streak === 0 ? '—' : `${habit.streak}j` },
          { label: 'Meilleure série', value: habit.bestStreak === 0 ? '—' : `${habit.bestStreak}j` },
          { label: 'Cette semaine', value: `${last7Done}/7` },
          { label: '2 dernières sem.', value: `${doneCount}/14` },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <p className={`text-lg font-bold ${t.accentText.split(' ')[0]}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {[week1, week2].map((week, wi) => (
          <div key={wi} className="flex gap-1.5">
            {week.map(day => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5"
                title={`${format(new Date(day.date + 'T12:00:00'), 'EEEE d MMM', { locale: fr })} — ${day.done ? '✅ fait' : '❌ oublié'}`}>
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-semibold
                  ${day.done
                    ? 'text-white'
                    : day.isToday ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'
                  }`}
                  style={day.done ? { background: day.isToday ? t.chartPrimary : `${t.chartPrimary}cc` } : {}}>
                  {day.dayNum}
                </div>
                <span className={`text-xs ${day.isToday ? 'font-bold text-gray-600' : 'text-gray-300'}`}>{day.dayLetter}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

//  Vue hebdomadaire : 12 semaines 

function WeeklyHabitView({ habit }: { habit: Habit }) {
  const t = useTheme()

  const weeks = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const monday = startOfWeek(subWeeks(new Date(), 11 - i), { weekStartsOn: 1 })
    const key = format(monday, 'yyyy-MM-dd')
    const done = habit.completedDates.some(d => getWeekKey(new Date(d + 'T12:00:00')) === key)
    return { key, label: format(monday, "'S'w", { locale: fr }), monthLabel: format(monday, 'MMM', { locale: fr }), done }
  }), [habit])

  const doneCount = weeks.filter(w => w.done).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Série actuelle', value: habit.streak === 0 ? '—' : `${habit.streak} sem` },
          { label: 'Meilleure série', value: habit.bestStreak === 0 ? '—' : `${habit.bestStreak} sem` },
          { label: 'Réussi (12 sem)', value: `${doneCount}/12` },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <p className={`text-lg font-bold ${t.accentText.split(' ')[0]}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {weeks.map(week => (
          <div key={week.key}
            title={`Semaine du ${format(new Date(week.key + 'T12:00:00'), 'd MMM', { locale: fr })} — ${week.done ? '✅ fait' : '❌ oublié'}`}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 cursor-default
              ${week.done ? 'border-transparent' : 'border-gray-100 bg-gray-50'}`}
            style={week.done ? { background: t.chartPrimary } : {}}>
            <span className={`text-xs font-semibold ${week.done ? 'text-white' : 'text-gray-500'}`}>{week.label}</span>
            <span className={`text-xs ${week.done ? 'text-white/70' : 'text-gray-300'}`}>{week.monthLabel}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

//  Vue mensuelle : 12 mois 

function MonthlyHabitView({ habit }: { habit: Habit }) {
  const t = useTheme()

  const months = useMemo(() => {
    const end = new Date()
    const start = subMonths(startOfMonth(end), 11)
    return eachMonthOfInterval({ start, end }).map(date => {
      const key = getMonthKey(date)
      const done = habit.completedDates.some(d => getMonthKey(new Date(d + 'T12:00:00')) === key)
      return { key, label: format(date, 'MMM', { locale: fr }), yearLabel: format(date, 'yy'), done }
    })
  }, [habit])

  const doneCount = months.filter(m => m.done).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Série actuelle', value: habit.streak === 0 ? '—' : `${habit.streak} mois` },
          { label: 'Meilleure série', value: habit.bestStreak === 0 ? '—' : `${habit.bestStreak} mois` },
          { label: 'Réussi (12 mois)', value: `${doneCount}/12` },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <p className={`text-lg font-bold ${t.accentText.split(' ')[0]}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {months.map(month => (
          <div key={month.key}
            title={`${month.label} 20${month.yearLabel} — ${month.done ? '✅ fait' : '❌ oublié'}`}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 cursor-default
              ${month.done ? 'border-transparent' : 'border-gray-100 bg-gray-50'}`}
            style={month.done ? { background: t.chartPrimary } : {}}>
            <span className={`text-sm font-bold capitalize ${month.done ? 'text-white' : 'text-gray-500'}`}>{month.label}</span>
            <span className={`text-xs ${month.done ? 'text-white/70' : 'text-gray-300'}`}>{month.yearLabel}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

//  Bloc habitudes fusionné 

function HabitsSection() {
  const { habits } = useAppStore()
  const t = useTheme()
  const [selectedId, setSelectedId] = useState<string>('__all__')

  const selected = selectedId === '__all__' ? null : habits.find(h => h.id === selectedId) ?? null

  const freqLabel: Record<Habit['frequency'], string> = {
    daily: 'quotidienne',
    weekly: 'hebdomadaire',
    monthly: 'mensuelle',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Habitudes</h3>
        <div className="relative">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 ${t.ring} transition-colors duration-100`}>
            <option value="__all__">Toutes les habitudes</option>
            {habits.length > 0 && <option disabled></option>}
            {habits.map(h => (
              <option key={h.id} value={h.id}>
                {h.title} · {freqLabel[h.frequency]}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      {selected && (
        <div className="flex items-center gap-2 mb-4">
          <span className="font-medium text-gray-800">{selected.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.badge}`}>
            {freqLabel[selected.frequency]}
          </span>
        </div>
      )}

      {!selected && <AllHabitsView />}
      {selected?.frequency === 'daily'   && <DailyHabitView   habit={selected} />}
      {selected?.frequency === 'weekly'  && <WeeklyHabitView  habit={selected} />}
      {selected?.frequency === 'monthly' && <MonthlyHabitView habit={selected} />}
    </div>
  )
}

//  Heatmap globale (12 semaines) 

function HabitHeatmap() {
  const { habits } = useAppStore()
  const t = useTheme()

  const days = useMemo(() => {
    const end = new Date()
    const start = subDays(end, 83)
    return eachDayOfInterval({ start, end }).map(date => {
      const str = format(date, 'yyyy-MM-dd')
      const count = habits.filter(h => h.completedDates.includes(str)).length
      return { date: str, count, total: habits.length }
    })
  }, [habits])

  const getColor = (count: number, total: number) => {
    if (total === 0 || count === 0) return t.heatmap[0]
    const ratio = count / total
    if (ratio >= 0.8) return t.heatmap[4]
    if (ratio >= 0.5) return t.heatmap[3]
    if (ratio >= 0.2) return t.heatmap[2]
    return t.heatmap[1]
  }

  const weeks: typeof days[] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Vue d'ensemble — 12 semaines
      </h3>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(day => (
              <div key={day.date}
                title={`${day.date} — ${day.count}/${day.total} habitudes`}
                className={`w-3 h-3 rounded-sm ${getColor(day.count, day.total)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-400">Moins</span>
        {t.heatmap.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
        <span className="text-xs text-gray-400">Plus</span>
      </div>
    </div>
  )
}

//  Progression des objectifs 

function GoalsProgress() {
  const { goals } = useAppStore()
  const t = useTheme()
  if (goals.length === 0) return null

  const active = goals.filter(g => g.status !== 'completed')
  const completed = goals.filter(g => g.status === 'completed')

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Objectifs
      </h3>
      <div className="space-y-4">
        {active.map(goal => (
          <div key={goal.id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium truncate pr-4">{goal.title}</span>
              <span className="text-gray-500 flex-shrink-0">{goal.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${goal.progress}%`, background: `linear-gradient(90deg, ${t.chartPrimary}, ${t.chartSecondary})` }} />
            </div>
            {goal.dueDate && (
              <p className="text-xs text-gray-400 mt-1">
                Échéance {format(new Date(goal.dueDate), 'd MMM yyyy', { locale: fr })}
                {goal.milestones.length > 0 && ` · ${goal.milestones.filter(m => m.done).length}/${goal.milestones.length} étapes`}
              </p>
            )}
          </div>
        ))}
        {completed.length > 0 && (
          <p className="text-xs text-gray-400 pt-1 border-t border-gray-50">
            {completed.length} objectif{completed.length > 1 ? 's' : ''} terminé{completed.length > 1 ? 's' : ''} ✅
          </p>
        )}
      </div>
    </div>
  )
}

//  Chiffres clés (4 métriques essentielles) 

function KeyNumbers() {
  const { habits, goals } = useAppStore()
  const t = useTheme()

  const bestStreak = Math.max(0, ...habits.map(h => h.bestStreak))
  const currentBest = Math.max(0, ...habits.map(h => h.streak))
  const avgProgress = goals.filter(g => g.status !== 'completed').length
    ? Math.round(goals.filter(g => g.status !== 'completed').reduce((acc, g) => acc + g.progress, 0) / goals.filter(g => g.status !== 'completed').length)
    : 0

  const stats = [
    { label: 'Habitudes actives', value: habits.length, icon: '🔄' },
    { label: 'Série en cours', value: currentBest === 0 ? '—' : `${currentBest}j`, icon: '🔥' },
    { label: 'Meilleure série', value: bestStreak === 0 ? '—' : `${bestStreak}j`, icon: '🏆' },
    { label: 'Progression moy.', value: `${avgProgress}%`, icon: '🎯' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(s => (
        <div key={s.label} className={`bg-white rounded-2xl border border-gray-100 p-4 text-center ${t.cardHover} transition-colors duration-100`}>
          <p className="text-xl mb-1">{s.icon}</p>
          <p className={`text-2xl font-bold ${t.accentText.split(' ')[0]}`}>{s.value}</p>
          <p className="text-xs text-gray-400 mt-1 leading-tight">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

//  Vue principale 

export default function StatsView() {
  const t = useTheme()
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Statistiques</h2>
      <KeyNumbers />
      <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${t.cardHover} transition-colors duration-100`}>
        <HabitsSection />
      </div>
      <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${t.cardHover} transition-colors duration-100`}>
        <HabitHeatmap />
      </div>
      <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${t.cardHover} transition-colors duration-100`}>
        <GoalsProgress />
      </div>
    </div>
  )
}
