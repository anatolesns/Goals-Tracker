import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store/UseAppStore'
import { useTheme } from '../theme'
import { generateId } from '../utils/global'
import AddItemModal from './AddItemModal'
import EditModal from './EditModal'
import type { Goal } from '../types'

function getDueDateInfo(dueDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: `En retard de ${-diffDays}j`, className: 'bg-red-100 text-red-700 font-semibold' }
  if (diffDays === 0) return { label: "À finir aujourd'hui !", className: 'bg-red-100 text-red-700 font-semibold' }
  if (diffDays === 1) return { label: 'Demain !', className: 'bg-orange-100 text-orange-700 font-semibold' }
  if (diffDays <= 3) return { label: `Dans ${diffDays} jours`, className: 'bg-orange-100 text-orange-700 font-semibold' }
  if (diffDays <= 7) return { label: `Dans ${diffDays} jours`, className: 'bg-yellow-100 text-yellow-700' }
  return { label: new Date(dueDate).toLocaleDateString('fr-FR'), className: 'bg-gray-100 text-gray-500' }
}

function sortGoalsByUrgency(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (b.status === 'completed' && a.status !== 'completed') return -1
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}

export default function GoalsView({ highlightedGoalId, onClearHighlight }: { highlightedGoalId?: string | null; onClearHighlight?: () => void }) {
  const { goals, toggleMilestone, removeGoal } = useAppStore()
  const t = useTheme()
  const [showModal, setShowModal] = useState(false)
  const [newMilestone, setNewMilestone] = useState<Record<string, string>>({})
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!highlightedGoalId) return
    const el = cardRefs.current[highlightedGoalId]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const timer = setTimeout(() => onClearHighlight?.(), 2000)
    return () => clearTimeout(timer)
  }, [highlightedGoalId])

  const addMilestone = (goalId: string) => {
    const title = newMilestone[goalId]?.trim()
    if (!title) return
    const { goals: currentGoals } = useAppStore.getState()
    const goal = currentGoals.find(g => g.id === goalId)
    if (!goal) return
    useAppStore.setState(state => ({
      goals: state.goals.map(g =>
        g.id === goalId
          ? { ...g, milestones: [...g.milestones, { id: generateId(), title, done: false }] }
          : g
      )
    }))
    setNewMilestone(prev => ({ ...prev, [goalId]: '' }))
  }

  const sortedGoals = sortGoalsByUrgency(goals)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Objectifs</h2>
        <button onClick={() => setShowModal(true)}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${t.btn}`}>
          + Nouvel objectif
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Aucun objectif pour l'instant</p>
          <p className="text-sm">Ajoute ton premier objectif long terme ✨</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedGoals.map(goal => {
            const dueDateInfo = goal.dueDate ? getDueDateInfo(goal.dueDate) : null
            const isUrgent = !!dueDateInfo && (dueDateInfo.className.includes('red') || dueDateInfo.className.includes('orange'))
            const isHighlighted = highlightedGoalId === goal.id

            return (
              <div
                key={goal.id}
                ref={el => { cardRefs.current[goal.id] = el }}
                className={`bg-white rounded-2xl border p-5 space-y-4 transition-all duration-500
                  ${isHighlighted ? t.highlightRing
                    : isUrgent && goal.status !== 'completed' ? 'border-red-200'
                    : 'border-gray-100'}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800">{goal.title}</h3>
                    {goal.description && <p className="text-sm text-gray-500 mt-1">{goal.description}</p>}
                    {dueDateInfo && goal.status !== 'completed' && (
                      <span className={`inline-flex items-center gap-1 mt-2 text-xs px-2.5 py-1 rounded-full ${dueDateInfo.className}`}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        {dueDateInfo.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full
                      ${goal.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        goal.status === 'in_progress' ? `${t.badge}` :
                        'bg-gray-100 text-gray-500'}`}>
                      {goal.status === 'completed' ? 'Terminé' :
                       goal.status === 'in_progress' ? 'En cours' : 'Non démarré'}
                    </span>
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className={`p-1.5 text-gray-300 rounded-lg transition-colors duration-100 hover:bg-amber-50 hover:text-amber-400`}
                      title="Modifier">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => { if (confirm(`Supprimer "${goal.title}" ?`)) removeGoal(goal.id) }}
                      className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors duration-100"
                      title="Supprimer l'objectif">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Barre de progression */}
                <div>
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progression</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isUrgent && goal.status !== 'completed' ? 'bg-red-400' : t.progressBar}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <ul className="space-y-2">
                    {goal.milestones.map(m => (
                      <li key={m.id} onClick={() => toggleMilestone(goal.id, m.id)}
                        className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-100
                          ${m.done ? t.checkDone : `border-gray-300 ${t.checkHover}`}`}>
                          {m.done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                        </div>
                        <span className={`text-sm ${m.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{m.title}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Ajouter milestone */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ajouter une étape..."
                    value={newMilestone[goal.id] ?? ''}
                    onChange={e => setNewMilestone(prev => ({ ...prev, [goal.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addMilestone(goal.id)}
                    className={`flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 ${t.ring}`}
                  />
                  <button onClick={() => addMilestone(goal.id)}
                    className={`px-3 py-2 bg-gray-100 rounded-lg text-sm transition-colors duration-100 hover:bg-amber-50 hover:text-amber-600`}>
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

    {showModal && <AddItemModal type="goal" onClose={() => setShowModal(false)} />}
    {editingGoal && (<EditModal target={{ type: 'goal', item: editingGoal }}
        onClose={() => setEditingGoal(null)} />)}
    </div>
  )
}
