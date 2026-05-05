import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', icon: '汉', label: 'Trang chủ' },
  { to: '/library', icon: '书', label: 'Thư viện' },
  { to: '/flashcards', icon: '卡', label: 'Flashcard' },
  { to: '/quiz', icon: '问', label: 'Quiz' },
  { to: '/write', icon: '写', label: 'Luyện viết' },
  { to: '/decks', icon: '组', label: 'Bộ thẻ' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="min-h-screen bg-[#f8f4ec] text-gray-900 flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#fff4d8,transparent_34%),radial-gradient(circle_at_bottom_right,#dce9ff,transparent_28%)] opacity-90" />

      {!isHome && (
        <header className="sticky top-0 z-40 border-b border-border bg-[#f8f4ec]/90 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
            <NavLink to="/" className="font-hanzi text-2xl text-hanzi leading-none">汉</NavLink>
            <NavLink to="/settings" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Cài đặt
            </NavLink>
          </div>
        </header>
      )}

      <main className="relative flex-1 max-w-2xl mx-auto w-full px-4 pb-24 pt-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-[#f8f4ec]/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-2">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center py-2 px-1 min-w-[52px] text-center transition-colors ${
                    isActive ? 'text-hanzi' : 'text-gray-500 hover:text-gray-800'
                  }`
                }
              >
                <span className="text-xl leading-tight font-hanzi">{item.icon}</span>
                <span className="text-[10px] mt-0.5 font-ui leading-none">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
