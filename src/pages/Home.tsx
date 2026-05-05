import { NavLink } from 'react-router-dom'
import { getDataStats, getAllTopics } from '../data'

const cards = [
  { to: '/lesson', icon: '课', title: 'Học ngay', sub: 'Lesson ngẫu nhiên', color: 'border-hanzi/40 hover:border-hanzi' },
  { to: '/flashcards', icon: '卡', title: 'Flashcard', sub: 'Lật thẻ nhớ chữ', color: 'border-pinyin/40 hover:border-pinyin' },
  { to: '/quiz', icon: '问', title: 'Quiz', sub: 'Kiểm tra kiến thức', color: 'border-vi/40 hover:border-vi' },
  { to: '/write', icon: '写', title: 'Luyện viết', sub: 'Kiểm tra từng nét', color: 'border-en/40 hover:border-en' },
  { to: '/library', icon: '书', title: 'Thư viện', sub: 'Duyệt toàn bộ mục từ', color: 'border-gray-600 hover:border-gray-400' },
  { to: '/decks', icon: '组', title: 'Bộ thẻ', sub: 'Tạo nhóm từ riêng', color: 'border-gray-600 hover:border-gray-400' },
]

export function Home() {
  const stats = getDataStats()
  const featuredTopics = getAllTopics().slice(0, 6)

  return (
    <div className="py-6 flex flex-col gap-6">
      <div className="rounded-[28px] border border-border bg-surface-2/80 p-6 text-center pt-7 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
        <div className="font-hanzi text-6xl text-hanzi mb-2">汉字学</div>
        <p className="text-gray-200 text-base">Học chữ Hán từ gốc</p>
        <p className="text-gray-500 text-sm mt-2">
          Flashcard, quiz và luyện viết song ngữ Trung-Việt / Trung-Anh
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 text-center">
        <div className="flex justify-center gap-6 text-sm text-gray-500">
          <span><span className="text-hanzi font-medium">{stats.wordCount}</span> mục từ</span>
          <span><span className="text-pinyin font-medium">{stats.topicCount}</span> chủ đề</span>
          <span><span className="text-vi font-medium">{stats.radicalCount}</span> bộ thủ</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <NavLink
            key={card.to}
            to={card.to}
            className={`rounded-2xl border bg-surface-2 p-4 flex flex-col gap-1.5 transition-all hover:bg-surface-3 active:scale-[0.97] ${card.color}`}
          >
            <span className="text-2xl font-hanzi text-gray-700">{card.icon}</span>
            <span className="font-medium text-gray-200 text-sm">{card.title}</span>
            <span className="text-xs text-gray-400">{card.sub}</span>
          </NavLink>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface-2 p-4">
        <p className="text-xs text-gray-600 text-center">
          Tất cả dữ liệu học và stroke assets đều được đóng sẵn trong build output.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface-2 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-200">Chủ đề nên bắt đầu</p>
          <NavLink to="/lesson" className="text-xs text-pinyin hover:text-white transition-colors">
            Tạo lesson
          </NavLink>
        </div>
        <div className="flex flex-wrap gap-2">
          {featuredTopics.map((topic) => (
            <NavLink
              key={topic}
              to="/library"
              className="rounded-full border border-border px-3 py-1.5 text-xs text-gray-400 hover:border-pinyin hover:text-pinyin transition-colors"
            >
              {topic}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <NavLink to="/settings" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          Cài đặt ngôn ngữ và cách học
        </NavLink>
      </div>
    </div>
  )
}
