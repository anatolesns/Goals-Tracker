import { useState } from 'react'
import { useAppStore } from '../store/UseAppStore'
import { useTheme } from '../theme'

interface Props {
  type: 'goal' | 'habit' | 'task'
  onClose: () => void
}

export default function AddItemModal({ type, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const { addGoal, addHabit, addDailyTask } = useAppStore()
  const t = useTheme()

  const labels = {
    goal: { title: 'Nouvel objectif', placeholder: 'Ex: Apprendre TypeScript' },
    habit: { title: 'Nouvelle habitude', placeholder: 'Ex: Méditation 10min' },
    task: { title: 'Nouvelle tâche', placeholder: 'Ex: Envoyer le rapport' },
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    if (type === 'goal') addGoal(title, description, dueDate || undefined)
    if (type === 'habit') addHabit(title, frequency)
    if (type === 'task') addDailyTask(title)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{labels[type].title}</h2>

        <input
          autoFocus
          type="text"
          placeholder={labels[type].placeholder}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 mb-3 ${t.ring}`}
        />

        {type === 'habit' && (
          <div className="flex gap-2 mb-3">
            {(['daily', 'weekly', 'monthly'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors duration-100 ${
                  frequency === f
                    ? t.btn + ' border-transparent'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {f === 'daily' ? 'Quotidien' : f === 'weekly' ? 'Hebdo' : 'Mensuel'}
              </button>
            ))}
          </div>
        )}

        {type === 'goal' && (
          <>
            <textarea
              placeholder="Description (optionnel)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 mb-3 resize-none h-24 ${t.ring}`}
            />
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 mb-3 ${t.ring}`}
            />
          </>
        )}

        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-100">
            Annuler
          </button>
          <button onClick={handleSubmit} className={`flex-1 py-3 rounded-xl font-medium ${t.btn}`}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}
