import { useState } from 'react'
import { useAppStore } from '../store/UseAppStore'
import type { Goal, Habit, DailyTask } from '../types'

type EditTarget =
  | { type: 'goal'; item: Goal }
  | { type: 'habit'; item: Habit }
  | { type: 'task'; item: DailyTask }

interface Props {
  target: EditTarget
  onClose: () => void
}

export default function EditModal({ target, onClose }: Props) {
  const { updateGoal, updateHabit, updateDailyTask } = useAppStore()

  const [title, setTitle] = useState(target.item.title)
  const [description, setDescription] = useState(
    target.type === 'goal' ? (target.item.description ?? '') : ''
  )
  const [dueDate, setDueDate] = useState(
    target.type === 'goal' ? (target.item.dueDate ?? '') : ''
  )
  const [frequency, setFrequency] = useState(
    target.type === 'habit' ? target.item.frequency : 'daily'
  )

  const handleSave = () => {
    if (!title.trim()) return
    if (target.type === 'goal') {
      updateGoal(target.item.id, {
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
      })
    }
    if (target.type === 'habit') {
      updateHabit(target.item.id, { title, frequency })
    }
    if (target.type === 'task') {
      updateDailyTask(target.item.id, { title })
    }
    onClose()
  }

  const labels = {
    goal: 'Modifier l\'objectif',
    habit: 'Modifier l\'habitude',
    task: 'Modifier la tâche',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">{labels[target.type]}</h2>

        {/* Titre */}
        <label className="block text-sm text-gray-500 mb-1">Titre</label>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
        />

        {/* Champs spécifiques aux objectifs */}
        {target.type === 'goal' && (
          <>
            <label className="block text-sm text-gray-500 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optionnel)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4 resize-none h-24"
            />
            <label className="block text-sm text-gray-500 mb-1">Échéance</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
            />
          </>
        )}

        {/* Fréquence pour les habitudes */}
        {target.type === 'habit' && (
          <>
            <label className="block text-sm text-gray-500 mb-1">Fréquence</label>
            <div className="flex gap-2 mb-4">
              {(['daily', 'weekly', 'monthly'] as const).map(f => {
                const labels = { daily: 'Quotidienne', weekly: 'Hebdo', monthly: 'Mensuelle' }
                return (
                  <button key={f} onClick={() => setFrequency(f)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition border
                      ${frequency === f
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'text-gray-500 border-gray-200 hover:border-indigo-300'}`}>
                    {labels[f]}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            Annuler
          </button>
          <button onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}