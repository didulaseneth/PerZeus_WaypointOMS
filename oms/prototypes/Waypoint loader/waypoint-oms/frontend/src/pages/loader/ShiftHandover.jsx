import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Barcode, LogOut } from 'lucide-react'
import AppHeader from '../../components/AppHeader'

export default function ShiftHandover() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [detected, setDetected] = useState(false)

  // Attempt real camera scan; auto-detect after 3s as fallback for demo
  useEffect(() => {
    let stop = false
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (stop) return stream.getTracks().forEach((t) => t.stop())
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setScanning(true)
        }
      } catch {
        // Camera denied — fall back to simulated scan
      }
    }
    startCam()
    const t = setTimeout(() => setDetected(true), 3000)
    return () => { stop = true; clearTimeout(t) }
  }, [])

  const handleHandover = () => navigate('/loader/handover/confirm')

  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle">
      <AppHeader showNav activeNav="Home" />

      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-24">
        <button
          onClick={() => navigate('/loader/manifest/204')}
          className="mb-3 flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Shift Handover
        </button>

        {/* Current handover card */}
        <div className="card p-4">
          <p className="text-xs font-semibold text-ink-muted">Current:</p>
          <p className="text-base font-extrabold text-ink">Sandipa H.</p>
          <p className="mt-1 text-xs text-ink-muted">
            12 runs loaded · 2 exceptions pending
          </p>
        </div>

        {/* Camera / scan card */}
        <div className="card mt-3 overflow-hidden">
          <div className="relative h-52 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover opacity-80"
            />
            {/* Barcode frame */}
            <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-white/60" />
            {detected && (
              <div className="absolute inset-x-4 bottom-4 rounded-xl bg-success px-3 py-2 text-center text-xs font-bold text-white">
                ✓ Loader badge detected
              </div>
            )}
          </div>
          <div className="px-4 py-3 text-center text-xs text-ink-muted">
            Scan incoming loader badge
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-surface-border bg-white px-4 py-3 dark:bg-slate-800">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleHandover}
            disabled={!detected}
            className="btn-primary w-full disabled:bg-surface-muted disabled:text-ink-faint"
          >
            Hand Over Shift
          </button>
          <button
            onClick={() => navigate('/loader/login')}
            className="mt-2 w-full text-center text-xs font-semibold text-brand-600"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}