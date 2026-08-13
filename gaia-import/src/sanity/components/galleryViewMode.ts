export type ViewMode = 'list' | 'medium' | 'large'

const STORAGE_KEY = 'furlanetto:gallery-view'
const DEFAULT_VIEW: ViewMode = 'medium'

export function loadViewMode(): ViewMode {
  if (typeof window === 'undefined') return DEFAULT_VIEW
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'list' || stored === 'medium' || stored === 'large') {
    return stored
  }
  return DEFAULT_VIEW
}

export function saveViewMode(mode: ViewMode): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, mode)
}

export const VIEW_MODE_CONFIG: Record<ViewMode, { thumbPx: number; gridCols: number; label: string }> = {
  list:   { thumbPx: 64,  gridCols: 1, label: 'Lista' },
  medium: { thumbPx: 120, gridCols: 4, label: 'Médio' },
  large:  { thumbPx: 200, gridCols: 3, label: 'Grande' },
}
