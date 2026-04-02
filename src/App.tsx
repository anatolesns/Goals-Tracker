import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useSync } from './hooks/useSync'
import { ThemeContext, themes } from './theme'
import AuthScreen from './components/AuthScreen'
import DailyView from './components/DailyView'
import GoalsView from './components/GoalsView'
import StatsView from './components/StatsView'
import NotificationsView from './components/NotificationsView'
import type { User } from '@supabase/supabase-js'

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

// App principale (utilisateur connecté)

function AppContent({ user }: { user: User }) {
  const [tab, setTab] = useState<Tab>('daily')
  const [highlightedGoalId, setHighlightedGoalId] = useState<string | null>(null)

  useSync(user.id)

  function goToGoal(goalId: string) {
    setHighlightedGoalId(goalId)
    setTab('goals')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const theme = TAB_THEMES[tab]

  return (
    <ThemeContext.Provider value={theme}>
      <div className={`min-h-screen ${theme.pageBg}`}>
        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* Header utilisateur */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{user.email}</p>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-400 transition px-2 py-1 rounded-lg hover:bg-red-50">
              Déconnexion
            </button>
          </div>

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

// Racine : gestion de la session

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    )
  }

  return user ? <AppContent user={user} /> : <AuthScreen />
}