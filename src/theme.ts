import { createContext, useContext } from 'react'

export type Theme = {
  btn: string
  accentText: string
  ring: string
  checkDone: string
  checkHover: string
  cardHover: string
  progressBar: string
  pageBg: string
  navActive: string
  badge: string
  heatmap: readonly [string, string, string, string, string]
  chartPrimary: string
  chartSecondary: string
  toggleOn: string
  highlightRing: string
}

export const themes = {
  daily: {
    btn: 'bg-violet-500 text-white hover:bg-violet-600 transition-colors duration-100',
    accentText: 'text-violet-500 hover:text-violet-700',
    ring: 'focus:outline-none focus:ring-2 focus:ring-violet-400',
    checkDone: 'bg-violet-500 border-violet-500',
    checkHover: 'group-hover:border-violet-400',
    cardHover: 'hover:border-violet-200',
    progressBar: 'bg-violet-500',
    pageBg: 'bg-violet-100/80',
    navActive: 'bg-violet-500 text-white shadow-sm',
    badge: 'bg-violet-50 text-violet-600',
    heatmap: ['bg-gray-100', 'bg-violet-100', 'bg-violet-200', 'bg-violet-300', 'bg-violet-500'] as const,
    chartPrimary: '#7c3aed',
    chartSecondary: '#a78bfa',
    toggleOn: 'bg-violet-500',
    highlightRing: 'ring-2 ring-violet-300 ring-offset-1 border-violet-400',
  },
  goals: {
    btn: 'bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-100',
    accentText: 'text-amber-500 hover:text-amber-700',
    ring: 'focus:outline-none focus:ring-2 focus:ring-amber-400',
    checkDone: 'bg-amber-500 border-amber-500',
    checkHover: 'group-hover:border-amber-400',
    cardHover: 'hover:border-amber-200',
    progressBar: 'bg-amber-500',
    pageBg: 'bg-amber-100/80',
    navActive: 'bg-amber-500 text-white shadow-sm',
    badge: 'bg-amber-50 text-amber-600',
    heatmap: ['bg-gray-100', 'bg-amber-100', 'bg-amber-200', 'bg-amber-300', 'bg-amber-500'] as const,
    chartPrimary: '#f59e0b',
    chartSecondary: '#fcd34d',
    toggleOn: 'bg-amber-500',
    highlightRing: 'ring-2 ring-amber-300 ring-offset-1 border-amber-400',
  },
  stats: {
    btn: 'bg-cyan-500 text-white hover:bg-cyan-600 transition-colors duration-100',
    accentText: 'text-cyan-500 hover:text-cyan-700',
    ring: 'focus:outline-none focus:ring-2 focus:ring-cyan-400',
    checkDone: 'bg-cyan-500 border-cyan-500',
    checkHover: 'group-hover:border-cyan-400',
    cardHover: 'hover:border-cyan-200',
    progressBar: 'bg-cyan-500',
    pageBg: 'bg-cyan-100/80',
    navActive: 'bg-cyan-500 text-white shadow-sm',
    badge: 'bg-cyan-50 text-cyan-600',
    heatmap: ['bg-gray-100', 'bg-cyan-100', 'bg-cyan-200', 'bg-cyan-300', 'bg-cyan-500'] as const,
    chartPrimary: '#06b6d4',
    chartSecondary: '#67e8f9',
    toggleOn: 'bg-cyan-500',
    highlightRing: 'ring-2 ring-cyan-300 ring-offset-1 border-cyan-400',
  },
  notifications: {
    btn: 'bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-100',
    accentText: 'text-emerald-500 hover:text-emerald-700',
    ring: 'focus:outline-none focus:ring-2 focus:ring-emerald-400',
    checkDone: 'bg-emerald-500 border-emerald-500',
    checkHover: 'group-hover:border-emerald-400',
    cardHover: 'hover:border-emerald-200',
    progressBar: 'bg-emerald-500',
    pageBg: 'bg-emerald-100/80',
    navActive: 'bg-emerald-500 text-white shadow-sm',
    badge: 'bg-emerald-50 text-emerald-600',
    heatmap: ['bg-gray-100', 'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-500'] as const,
    chartPrimary: '#10b981',
    chartSecondary: '#6ee7b7',
    toggleOn: 'bg-emerald-500',
    highlightRing: 'ring-2 ring-emerald-300 ring-offset-1 border-emerald-400',
  },
} as const

export type ThemeKey = keyof typeof themes

export const ThemeContext = createContext<Theme>(themes.daily)
export const useTheme = () => useContext(ThemeContext)
