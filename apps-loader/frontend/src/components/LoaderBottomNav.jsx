import { NavLink } from 'react-router-dom'
import { Home, Package, MessageSquare, User } from 'lucide-react'

const items = [
  { to: '/loader',         label: 'Home',    icon: Home,          end: true },
  { to: '/loader/loads',   label: 'Loads',   icon: Package },
  { to: '/loader/inbox',   label: 'Inbox',   icon: MessageSquare },
  { to: '/loader/profile', label: 'Profile', icon: User },
]

export default function LoaderBottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-surface-border bg-white">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[11px] font-semibold transition',
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'text-ink-muted hover:bg-brand-50 hover:text-brand-600',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}