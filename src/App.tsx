import { useState } from 'react'
import DailyView from './components/DailyView'
import GoalsView from './components/GoalsView'
import StatsView from './components/StatsView'
import NotificationsView from './components/NotificationsView'
import { ThemeContext, themes } from './theme'

type Tab = 'daily' | 'goals' | 'stats' | 'notifications'

const TAB_LABELS: [Tab, string][] = [
  ['daily', "Aujourd'hui"],
  ['goals', 'Objectifs'],
  ['stats', 'Stats'],
  ['notifications', 'Rappels'],
]

const TAB_THEMES: Record<Tab, typeof themes[keyof typeof themes]> = {
  daily: themes.daily,
  goals: themes.goals,
  stats: themes.stats,
  notifications: themes.notifications,
}

export default function App() {
  const [tab, setTab] = useState<Tab>('daily')
  const [highlightedGoalId, setHighlightedGoalId] = useState<string | null>(null)

  function goToGoal(goalId: string) {
    setHighlightedGoalId(goalId)
    setTab('goals')
  }

  const theme = TAB_THEMES[tab]

  return (
    <ThemeContext.Provider value={theme}>
      <div className={`min-h-screen ${theme.pageBg}`}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Navigation */}
          <nav className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-8 shadow-sm">
            {TAB_LABELS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setHighlightedGoalId(null) }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer
                  ${tab === key ? TAB_THEMES[key].navActive : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </nav>

          {/* Contenu */}
          {tab === 'daily' && <DailyView onGoToGoal={goToGoal} />}
          {tab === 'goals' && <GoalsView highlightedGoalId={highlightedGoalId} onClearHighlight={() => setHighlightedGoalId(null)} />}
          {tab === 'stats' && <StatsView />}
          {tab === 'notifications' && <NotificationsView />}
        </div>
      </div>
    </ThemeContext.Provider>
  )
}
