import { useNavigate } from 'react-router-dom'
import { Home, Package, MessageSquare, User, Sun, Sunset, Moon } from 'lucide-react'
import { useLoader } from '../store/LoaderStore'

export default function AppHeader({ showNav = false, activeNav = null, backTo = null }) {
  const { theme, cycleTheme, avatar } = useLoader()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Home',    Icon: Home,          to: '/loader/summary' },
    { label: 'Loads',   Icon: Package,       to: '/loader/manifest/204' },
    { label: 'Inbox',   Icon: MessageSquare, to: '/loader/inbox' },
    { label: 'Profile', Icon: User,          to: '/loader/profile' },
  ]

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dim' ? Sunset : Moon

  return (
    <header className="bg-white dark:bg-dark800">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate(backTo || '/loader/summary')}
          className="flex items-center gap-2"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purplePrimary text-[13px] font-bold text-whiteCustom">
            W
          </div>
          <span className="text-[15px] font-bold tracking-tight text-ink dark:text-darkText1">
            Waypoint <span className="font-semibold text-ink-muted dark:text-darkText2">Group</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-light px-3 py-1 text-xs font-semibold text-success-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Synced
          </span>

          {/* Theme cycle button */}
          <button
            onClick={cycleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray2 text-gray6 transition active:scale-95 dark:bg-dark700 dark:text-darkText2"
            aria-label={`Theme: ${theme} — tap to change`}
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>

          {/* Avatar */}
          <div className="h-8 w-8 overflow-hidden rounded-full bg-gray2 dark:bg-dark700">
            {avatar && <img src={avatar} alt="avatar" className="h-full w-full object-cover" />}
          </div>
        </div>
      </div>

      {showNav && (
        <div className="mx-auto max-w-md px-4 pb-3">
          <div className="flex items-center justify-around rounded-2xl bg-purplePrimary px-2 py-2 text-whiteCustom">
            {navItems.map(({ label, Icon, to }) => {
              const isActive = label === activeNav
              return (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1 text-[10px] font-semibold ${
                    isActive ? 'bg-white/20' : 'opacity-80'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}