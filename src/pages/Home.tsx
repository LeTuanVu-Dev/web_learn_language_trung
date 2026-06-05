import { NavLink } from 'react-router-dom'
import { useMemo } from 'react'
import { useSettings } from '../store/settings'
import { useVocabularyStore } from '../store/vocabulary'

export function Home() {
  const { primaryLanguage } = useSettings()
  const isVi = primaryLanguage === 'vi'
  const words = useVocabularyStore((state) => state.words)
  const officialTopics = useVocabularyStore((state) => state.officialTopics)
  const syncStatus = useVocabularyStore((state) => state.syncStatus)
  const syncMessage = useVocabularyStore((state) => state.syncMessage)

  const cards = [
    { to: '/lesson', icon: '课', title: isVi ? 'Học ngay' : 'Start learning', sub: isVi ? 'Lesson ngẫu nhiên' : 'Random lesson', color: 'border-hanzi/40 hover:border-hanzi' },
    { to: '/flashcards', icon: '卡', title: 'Flashcard', sub: isVi ? 'Lật thẻ nhớ chữ' : 'Flip cards to memorize', color: 'border-pinyin/40 hover:border-pinyin' },
    { to: '/quiz', icon: '问', title: 'Quiz', sub: isVi ? 'Kiểm tra kiến thức' : 'Check your knowledge', color: 'border-vi/40 hover:border-vi' },
    { to: '/write', icon: '写', title: isVi ? 'Luyện viết' : 'Writing', sub: isVi ? 'Chấm theo độ giống' : 'Shape-based scoring', color: 'border-en/40 hover:border-en' },
    { to: '/library', icon: '书', title: isVi ? 'Thư viện' : 'Library', sub: isVi ? 'Duyệt toàn bộ mục từ' : 'Browse all words', color: 'border-gray-500 hover:border-gray-700' },
    { to: '/decks', icon: '组', title: isVi ? 'Bộ thẻ' : 'Decks', sub: isVi ? 'Tạo và import bộ từ' : 'Create and import word decks', color: 'border-gray-500 hover:border-gray-700' },
  ]

  const radicalCount = useMemo(() => {
    const radicals = new Set<string>()
    words.forEach((word) => word.radicals.forEach((radical) => radicals.add(radical)))
    return radicals.size
  }, [words])

  const featuredTopics = officialTopics.slice(0, 6)
  const fallbackMessage = isVi
    ? 'Đang dùng dữ liệu fallback đã đóng gói sẵn.'
    : 'Using bundled fallback data.'

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="rounded-[28px] border border-border bg-surface-2/90 p-6 pt-7 text-center shadow-[0_10px_40px_rgba(199,168,120,0.12)]">
        <div className="mb-2 font-hanzi text-6xl text-hanzi">汉字学</div>
        <p className="text-base text-gray-900">{isVi ? 'Học chữ Hán từ gốc' : 'Learn Hanzi from the roots'}</p>
        <p className="mt-2 text-sm text-gray-700">
          {isVi
            ? 'Flashcard, quiz và luyện viết Việt-Trung / Anh-Trung với theme sáng dễ đọc.'
            : 'Flashcards, quizzes, and writing practice for English-Chinese / Vietnamese-Chinese.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 text-center">
        <div className="flex justify-center gap-6 text-sm text-gray-700">
          <span><span className="font-medium text-hanzi">{words.length}</span> {isVi ? 'mục từ' : 'words'}</span>
          <span><span className="font-medium text-pinyin">{officialTopics.length}</span> {isVi ? 'chủ đề' : 'topics'}</span>
          <span><span className="font-medium text-vi">{radicalCount}</span> {isVi ? 'bộ thủ' : 'radicals'}</span>
        </div>
        <p className={`text-xs ${syncStatus === 'loading' ? 'text-pinyin' : 'text-gray-600'}`}>
          {syncStatus === 'loading'
            ? (isVi ? 'Đang đồng bộ danh sách chủ đề...' : 'Syncing topic catalog...')
            : syncMessage || fallbackMessage}
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
          {isVi
            ? 'Dữ liệu HSK 1-5 và stroke assets được đóng gói sẵn. Chủ đề ưu tiên đồng bộ runtime, nếu thất bại sẽ dùng cache local.'
            : 'HSK 1-5 data and stroke assets are bundled. Topics prefer runtime sync and fall back to local cache.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">{isVi ? 'Chủ đề để bắt đầu' : 'Topics to start'}</p>
          <NavLink to="/lesson" className="text-xs text-pinyin transition-colors hover:text-blue-700">
            {isVi ? 'Tạo lesson' : 'Create lesson'}
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
            <span className="text-xs text-gray-600">{isVi ? 'Chưa có chủ đề cache.' : 'No cached topics yet.'}</span>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <NavLink to="/settings" className="text-xs text-gray-600 transition-colors hover:text-gray-900">
          {isVi ? 'Cài đặt ngôn ngữ và cách học' : 'Language and study settings'}
        </NavLink>
      </div>
    </div>
  )
}
