import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, X, ListOrdered, Eye } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import { useLoader } from '../../store/LoaderStore'

export default function LoadingManifest() {
  const { runId } = useParams()
  const navigate = useNavigate()
  const { runs } = useLoader()
  const [toast, setToast] = useState(true)

  const visibleRuns = runs.filter((r) => r.status !== 'completed')
  const allDone = visibleRuns.length === 0

  // If all runs are done, route user to the empty-state screen
  if (allDone) {
    navigate('/loader/empty', { replace: true })
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Loads" />

      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-6">
        <h1 className="text-[22px] font-extrabold text-ink">Loading Manifest</h1>

        <div className="mt-3 space-y-3">
          {visibleRuns.map((run) => {
            const isActive = run.status === 'active'
            const pct = Math.round((run.loadedItems / run.totalItems) * 100) || 0
            return (
              <div key={run.id} className="card p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-[15px] font-extrabold text-ink">{run.label}</span>
                  <span className="text-[13px] font-medium text-ink-muted">
                    · {run.vehicle} · {run.dock}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="text-[13px] font-medium text-success-dark">Synced</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[13px]">
                  <span className="font-bold text-ink">
                    {run.loadedItems} of {run.totalItems} items loaded
                  </span>
                  <span className="font-bold text-ink-muted">{pct}%</span>
                </div>

                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>

                {isActive && (
                  <button
                    onClick={() => navigate(`/loader/run/${run.id}`)}
                    className="btn-primary mt-4 w-full"
                  >
                    <ListOrdered className="h-4 w-4" />
                    Open Stop Sequence
                  </button>
                )}

                {run.viewOnly && (
                  <button
                    onClick={() => navigate(`/loader/run/${run.id}/locked`)}
                    className="btn-secondary mt-4 w-full"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="h-16" />
      </main>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-2xl bg-success px-4 py-3 text-white shadow-pop">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm font-semibold">Run plan updated — 2 items added</p>
            <button onClick={() => setToast(false)} aria-label="Dismiss">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}