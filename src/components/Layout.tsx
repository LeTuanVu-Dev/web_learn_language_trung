import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', icon: '汉', label: 'Trang chu' },
  { to: '/library', icon: '书', label: 'Thu vien' },
  { to: '/flashcards', icon: '卡', label: 'Flashcard' },
  { to: '/quiz', icon: '问', label: 'Quiz' },
  { to: '/write', icon: '写', label: 'Luyen viet' },
  { to: '/decks', icon: '组', label: 'Bo the' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f8f4ec] text-gray-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#fff4d8,transparent_34%),radial-gradient(circle_at_bottom_right,#f3f7ff,transparent_28%)] opacity-90" />

      {!isHome && (
        <header className="sticky top-0 z-40 border-b border-border bg-[#f8f4ec]/95 backdrop-blur-sm">
          <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-4">
            <NavLink to="/" className="font-hanzi text-2xl leading-none text-hanzi">汉</NavLink>
            <NavLink to="/settings" className="text-sm text-gray-700 transition-colors hover:text-gray-900">
              Cai dat
            </NavLink>
          </div>
        </header>
      )}

      <main className="relative mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-[#f8f4ec]/98 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-2">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex min-w-[52px] flex-col items-center px-1 py-2 text-center transition-colors ${
                    isActive ? 'text-hanzi' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <span className="font-hanzi text-xl leading-tight">{item.icon}</span>
                <span className="mt-0.5 font-ui text-[10px] leading-none">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
