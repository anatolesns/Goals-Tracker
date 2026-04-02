//  Demander la permission 

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

//  Envoyer une notification simple 

export function sendNotification(title: string, body: string, icon = '/vite.svg') {
  if (Notification.permission !== 'granted') return
  new Notification(title, { body, icon })
}

//  Planifier un rappel quotidien (heure HH:MM) 

export function scheduleDailyReminder(
  id: string,
  title: string,
  body: string,
  time: string // format "08:30"
): void {
  // Annuler un éventuel rappel existant pour cet id
  cancelReminder(id)

  const [hours, minutes] = time.split(':').map(Number)

  const now = new Date()
  const next = new Date()
  next.setHours(hours, minutes, 0, 0)

  // Si l'heure est déjà passée aujourd'hui → planifier pour demain
  if (next <= now) next.setDate(next.getDate() + 1)

  const delay = next.getTime() - now.getTime()

  const timeoutId = window.setTimeout(() => {
    sendNotification(title, body)
    // Replanifier pour le lendemain (toutes les 24h)
    const intervalId = window.setInterval(() => {
      sendNotification(title, body)
    }, 24 * 60 * 60 * 1000)
    saveReminderId(id, intervalId, 'interval')
  }, delay)

  saveReminderId(id, timeoutId, 'timeout')
}

//  Annuler un rappel 

export function cancelReminder(id: string): void {
  const stored = localStorage.getItem(`reminder_${id}`)
  if (!stored) return
  const { timerId, type } = JSON.parse(stored)
  if (type === 'timeout') window.clearTimeout(timerId)
  if (type === 'interval') window.clearInterval(timerId)
  localStorage.removeItem(`reminder_${id}`)
}

//  Helpers internes 

function saveReminderId(id: string, timerId: number, type: 'timeout' | 'interval') {
  localStorage.setItem(`reminder_${id}`, JSON.stringify({ timerId, type }))
}