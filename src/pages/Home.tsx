import { NavLink } from 'react-router-dom'
import { useMemo } from 'react'
import { useVocabularyStore } from '../store/vocabulary'

const cards = [
  { to: '/lesson', icon: '课', title: 'Hoc ngay', sub: 'Lesson ngau nhien', color: 'border-hanzi/40 hover:border-hanzi' },
  { to: '/flashcards', icon: '卡', title: 'Flashcard', sub: 'Lat the nho chu', color: 'border-pinyin/40 hover:border-pinyin' },
  { to: '/quiz', icon: '问', title: 'Quiz', sub: 'Kiem tra kien thuc', color: 'border-vi/40 hover:border-vi' },
  { to: '/write', icon: '写', title: 'Luyen viet', sub: 'Cham theo do giong', color: 'border-en/40 hover:border-en' },
  { to: '/library', icon: '书', title: 'Thu vien', sub: 'Duyet toan bo muc tu', color: 'border-gray-500 hover:border-gray-700' },
  { to: '/decks', icon: '组', title: 'Bo the', sub: 'Tao va import bo tu', color: 'border-gray-500 hover:border-gray-700' },
]

export function Home() {
  const { words, officialTopics, syncStatus, syncMessage } = useVocabularyStore((state) => ({
    words: state.words,
    officialTopics: state.officialTopics,
    syncStatus: state.syncStatus,
    syncMessage: state.syncMessage,
  }))

  const radicalCount = useMemo(() => {
    const radicals = new Set<string>()
    words.forEach((word) => word.radicals.forEach((radical) => radicals.add(radical)))
    return radicals.size
  }, [words])

  const featuredTopics = officialTopics.slice(0, 6)

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="rounded-[28px] border border-border bg-surface-2/90 p-6 pt-7 text-center shadow-[0_10px_40px_rgba(199,168,120,0.12)]">
        <div className="mb-2 font-hanzi text-6xl text-hanzi">汉字学</div>
        <p className="text-base text-gray-900">Hoc chu Han tu goc</p>
        <p className="mt-2 text-sm text-gray-700">
          Flashcard, quiz va luyen viet Trung-Viet / Trung-Anh voi theme sang de doc.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 text-center">
        <div className="flex justify-center gap-6 text-sm text-gray-700">
          <span><span className="font-medium text-hanzi">{words.length}</span> muc tu</span>
          <span><span className="font-medium text-pinyin">{officialTopics.length}</span> chu de</span>
          <span><span className="font-medium text-vi">{radicalCount}</span> bo thu</span>
        </div>
        <p className={`text-xs ${syncStatus === 'loading' ? 'text-pinyin' : 'text-gray-600'}`}>
          {syncStatus === 'loading'
            ? 'Dang dong bo danh sach chu de...'
            : syncMessage || 'Dang dung du lieu fallback da dong goi san.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <NavLink
            key={card.to}
            to={card.to}
            className={`flex flex-col gap-1.5 rounded-2xl border bg-surface-2 p-4 transition-all hover:bg-white active:scale-[0.97] ${card.color}`}
          >
            <span className="font-hanzi text-2xl text-gray-600">{card.icon}</span>
            <span className="text-sm font-medium text-gray-900">{card.title}</span>
            <span className="text-xs text-gray-700">{card.sub}</span>
          </NavLink>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface-2 p-4">
        <p className="text-center text-xs text-gray-600">
          Du lieu HSK 1-5 va stroke assets duoc dong goi san. Chu de uu tien dong bo runtime, neu that bai se dung cache local.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">Chu de de bat dau</p>
          <NavLink to="/lesson" className="text-xs text-pinyin transition-colors hover:text-blue-700">
            Tao lesson
          </NavLink>
        </div>
        <div className="flex flex-wrap gap-2">
          {featuredTopics.length > 0 ? featuredTopics.map((topic) => (
            <NavLink
              key={topic.id}
              to="/library"
              className="rounded-full border border-border px-3 py-1.5 text-xs text-gray-700 transition-colors hover:border-pinyin hover:text-pinyin"
            >
              {topic.name}
            </NavLink>
          )) : (
            <span className="text-xs text-gray-600">Chua co chu de cache.</span>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <NavLink to="/settings" className="text-xs text-gray-600 transition-colors hover:text-gray-900">
          Cai dat ngon ngu va cach hoc
        </NavLink>
      </div>
    </div>
  )
}
