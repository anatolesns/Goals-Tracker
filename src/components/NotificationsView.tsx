import { useState, useEffect } from 'react'
import { useAppStore } from '../store/UseAppStore'
import { useTheme } from '../theme'
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelReminder,
  sendNotification,
} from '../utils/notifications'

interface ReminderConfig {
  habitId: string
  time: string
  enabled: boolean
}

const STORAGE_KEY = 'reminder_configs'

function loadConfigs(): ReminderConfig[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveConfigs(configs: ReminderConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}

export default function NotificationsView() {
  const { habits } = useAppStore()
  const t = useTheme()
  const [permission, setPermission] = useState(Notification.permission)
  const [configs, setConfigs] = useState<ReminderConfig[]>(loadConfigs)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const updated = habits.map(habit => {
      const existing = configs.find(c => c.habitId === habit.id)
      return existing ?? { habitId: habit.id, time: '09:00', enabled: false }
    })
    setConfigs(updated)
  }, [habits])

  const askPermission = async () => {
    const granted = await requestNotificationPermission()
    setPermission(granted ? 'granted' : 'denied')
    if (granted) sendNotification('Notifications activées !', "Tu recevras tes rappels d'habitudes ici.")
  }

  const updateConfig = (habitId: string, patch: Partial<ReminderConfig>) => {
    setConfigs(prev => prev.map(c => c.habitId === habitId ? { ...c, ...patch } : c))
  }

  const applyReminders = () => {
    configs.forEach(config => {
      const habit = habits.find(h => h.id === config.habitId)
      if (!habit) return
      if (config.enabled) {
        scheduleDailyReminder(
          config.habitId,
          `Rappel : ${habit.title}`,
          "N'oublie pas ton habitude du jour ! 💪",
          config.time
        )
      } else {
        cancelReminder(config.habitId)
      }
    })
    saveConfigs(configs)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const testNotification = () => {
    sendNotification('Test de notification', 'Les rappels fonctionnent correctement ✅')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>

      {/* Statut de la permission */}
      <div className={`rounded-2xl p-5 border ${
        permission === 'granted'
          ? 'bg-emerald-50 border-emerald-200'
          : permission === 'denied'
          ? 'bg-red-50 border-red-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${
              permission === 'granted' ? 'text-emerald-700'
              : permission === 'denied' ? 'text-red-700'
              : 'text-amber-700'
            }`}>
              {permission === 'granted' && '✅ Notifications autorisées'}
              {permission === 'denied' && '❌ Notifications bloquées'}
              {permission === 'default' && '⚠️ Permission requise'}
            </p>
            <p className={`text-sm mt-1 ${
              permission === 'granted' ? 'text-emerald-600'
              : permission === 'denied' ? 'text-red-600'
              : 'text-amber-600'
            }`}>
              {permission === 'granted' && 'Tu peux configurer tes rappels ci-dessous.'}
              {permission === 'denied' && 'Autorise les notifications dans les paramètres du navigateur.'}
              {permission === 'default' && 'Clique pour autoriser les notifications.'}
            </p>
          </div>
          {permission !== 'denied' && (
            <div className="flex gap-2 flex-col">
              {permission === 'default' && (
                <button onClick={askPermission}
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors duration-100">
                  Autoriser
                </button>
              )}
              {permission === 'granted' && (
                <button onClick={testNotification}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${t.btn}`}>
                  Tester
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rappels par habitude */}
      {permission === 'granted' && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Rappels quotidiens
            </h3>

            {habits.length === 0 ? (
              <p className="text-gray-400 text-sm italic">
                Ajoute d'abord des habitudes dans l'onglet "Aujourd'hui"
              </p>
            ) : (
              <ul className="space-y-3">
                {configs.map(config => {
                  const habit = habits.find(h => h.id === config.habitId)
                  if (!habit) return null
                  return (
                    <li key={config.habitId}
                      className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => updateConfig(config.habitId, { enabled: !config.enabled })}
                          className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                            config.enabled ? t.toggleOn : 'bg-gray-200'
                          }`}>
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            config.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </button>
                        <span className="text-gray-700 truncate">{habit.title}</span>
                      </div>

                      <input
                        type="time"
                        value={config.time}
                        disabled={!config.enabled}
                        onChange={e => updateConfig(config.habitId, { time: e.target.value })}
                        className={`border rounded-lg px-3 py-1.5 text-sm transition-colors duration-100 ${t.ring} ${
                          config.enabled
                            ? 'border-gray-200 text-gray-700'
                            : 'border-gray-100 text-gray-300 bg-gray-50'
                        }`}
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {habits.length > 0 && (
            <button onClick={applyReminders}
              className={`w-full py-3 rounded-xl font-medium transition-colors duration-100 ${
                saved ? 'bg-emerald-500 text-white' : t.btn
              }`}>
              {saved ? '✅ Rappels enregistrés !' : 'Enregistrer les rappels'}
            </button>
          )}
        </>
      )}

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        Les rappels fonctionnent uniquement quand l'onglet est ouvert dans le navigateur.
        Pour des rappels en arrière-plan, une PWA avec Service Worker serait nécessaire.
      </p>
    </div>
  )
}
