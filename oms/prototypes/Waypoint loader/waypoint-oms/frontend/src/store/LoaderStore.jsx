import { createContext, useContext, useMemo, useState, useEffect } from 'react'

const LoaderContext = createContext(null)

const INITIAL_RUNS = [
  { id: '204', label: 'Run #204', vehicle: 'Van 04', dock: 'Dock Bay 3', totalItems: 12, loadedItems: 7,  status: 'active' },
  { id: '205', label: 'Run #205', vehicle: 'Van 07', dock: 'Dock Bay 1', totalItems: 10, loadedItems: 3,  status: 'queued' },
  { id: '206', label: 'Run #206', vehicle: 'Van 02', dock: 'Dock Bay 2', totalItems: 8,  loadedItems: 2,  status: 'queued', viewOnly: true },
]

const INITIAL_ITEMS = [
  { sku: '88213', name: 'Paracetamol 500mg', qty: '24 packs', zone: 'Rear',  status: 'pending' },
  { sku: '77341', name: 'Cough Syrup 100ml', qty: '12 packs', zone: 'Mid',   status: 'pending' },
  { sku: '66102', name: 'Vitamin C 500mg',   qty: '12 packs', zone: 'Front', status: 'pending' },
  { sku: '88214', name: 'Paracetamol 500mg', qty: '24 packs', zone: 'Rear',  status: 'pending' },
  { sku: '77342', name: 'Cough Syrup 100ml', qty: '12 packs', zone: 'Mid',   status: 'pending' },
  { sku: '66103', name: 'Vitamin C 500mg',   qty: '12 packs', zone: 'Front', status: 'pending' },
  { sku: '88215', name: 'Paracetamol 500mg', qty: '24 packs', zone: 'Rear',  status: 'pending' },
  { sku: '77343', name: 'Cough Syrup 100ml', qty: '12 packs', zone: 'Mid',   status: 'pending' },
  { sku: '66104', name: 'Vitamin C 500mg',   qty: '12 packs', zone: 'Front', status: 'pending' },
  { sku: '88216', name: 'Paracetamol 500mg', qty: '24 packs', zone: 'Rear',  status: 'pending' },
  { sku: '77344', name: 'Cough Syrup 100ml', qty: '12 packs', zone: 'Mid',   status: 'pending' },
  { sku: '66105', name: 'Vitamin C 500mg',   qty: '12 packs', zone: 'Front', status: 'pending' },
]

const INITIAL_STOPS = [
  { id: 's1', name: 'Kandy Pharmacy',  items: 4, zone: 'Rear',  status: 'current' },
  { id: 's2', name: 'Peradeniya Mart', items: 3, zone: 'Mid',   status: 'pending' },
  { id: 's3', name: 'Gampola Grocers', items: 5, zone: 'Front', status: 'pending' },
]

const INITIAL_MESSAGES = [
  {
    id: 'm1',
    from: 'Dispatch',
    time: '9:52 AM',
    title: 'Route Changed While Offline',
    subtitle: 'Tap to review',
    kind: 'route-change',
  },
]

export function LoaderProvider({ children }) {
  // 'light' | 'dim' | 'dark'
  const [theme, setTheme] = useState('light')
  const [runs, setRuns] = useState(INITIAL_RUNS)
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [stops, setStops] = useState(INITIAL_STOPS)
  const [exceptions, setExceptions] = useState([])
  const [pin, setPin] = useState('')
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [avatar, setAvatar] = useState(null)
  const [dock, setDock] = useState('Dock Bay 3')
  const [pendingUpdates, setPendingUpdates] = useState(3)

  // Apply theme classes to <html>
  useEffect(() => {
  const root = document.documentElement
  root.classList.remove('dark', 'dim')
  if (theme === 'dark') root.classList.add('dark')
  if (theme === 'dim')  root.classList.add('dim')   // dim is light + tint, NOT dark
}, [theme])

  const nextPendingItem = useMemo(() => items.find((i) => i.status === 'pending'), [items])
  const verifiedCount = items.filter((i) => i.status === 'verified').length
  const flaggedCount  = items.filter((i) => i.status === 'flagged').length
  const allHandled    = items.every((i) => i.status !== 'pending')

  const verifyItem = (sku) =>
    setItems((prev) => prev.map((i) => (i.sku === sku ? { ...i, status: 'verified' } : i)))

  const flagItem = (sku, reason, note) => {
    setItems((prev) => prev.map((i) => (i.sku === sku ? { ...i, status: 'flagged' } : i)))
    setExceptions((prev) => [
      ...prev,
      { sku, reason, note, at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ])
  }

  const markStopLoaded = (stopId) =>
    setStops((prev) => {
      const idx = prev.findIndex((s) => s.id === stopId)
      if (idx < 0) return prev
      const next = prev.map((s, i) => (i === idx ? { ...s, status: 'done' } : s))
      const nextPending = next.findIndex((s) => s.status === 'pending')
      if (nextPending >= 0) next[nextPending].status = 'current'
      return next
    })

  const completeRun = (runId) => {
    setRuns((prev) =>
      prev.map((r) => {
        if (r.id === runId) return { ...r, status: 'completed' }
        if (runId === '204' && r.id === '205') return { ...r, status: 'active' }
        return r
      })
    )
    setItems(INITIAL_ITEMS.map((i) => ({ ...i })))
    setStops(INITIAL_STOPS.map((s) => ({ ...s })))
    setExceptions([])
    setPin('')
  }

  const endShift = () => {
    setRuns(INITIAL_RUNS.map((r) => ({ ...r })))
    setItems(INITIAL_ITEMS.map((i) => ({ ...i })))
    setStops(INITIAL_STOPS.map((s) => ({ ...s })))
    setExceptions([])
    setPin('')
    setMessages(INITIAL_MESSAGES.map((m) => ({ ...m })))
    setAvatar(null)
  }

  // Cycle: light → dim → dark → light
  const cycleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dim' : t === 'dim' ? 'dark' : 'light'))
  }

  const value = {
    theme, setTheme, cycleTheme,
    runs, items, stops, exceptions, pin, messages, avatar, dock, pendingUpdates,
    nextPendingItem, verifiedCount, flaggedCount, allHandled,
    verifyItem, flagItem, markStopLoaded, setPin, setAvatar, setDock, setPendingUpdates,
    completeRun, endShift,
    setMessages,
  }

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>
}

export function useLoader() {
  const ctx = useContext(LoaderContext)
  if (!ctx) throw new Error('useLoader must be used inside LoaderProvider')
  return ctx
}