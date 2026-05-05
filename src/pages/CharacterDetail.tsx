import { NavLink, useParams } from 'react-router-dom'
import { wordById } from '../data'
import { LangDisplay } from '../components/LangDisplay'
import { WritingCanvas } from '../components/WritingCanvas'
import { useSettings } from '../store/settings'
import { useDecks } from '../store/decks'

export function CharacterDetail() {
  const { id } = useParams<{ id: string }>()
  const word = id ? wordById.get(id) : undefined
  const { writingCheckMode, showPinyin } = useSettings()
  const { decks, addWord, removeWord } = useDecks()

  if (!word) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>Không tìm thấy từ.</p>
        <NavLink to="/library" className="text-pinyin text-sm mt-2 block">← Về thư viện</NavLink>
      </div>
    )
  }

  const chars = Array.from(word.simplified)
  const customDecks = decks.filter((deck) => deck.isCustom)

  return (
    <div className="py-4 flex flex-col gap-6">
      <NavLink to="/library" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
        ← Thư viện
      </NavLink>

      <div className="flex flex-col items-center gap-2">
        <p className="font-hanzi text-8xl text-hanzi leading-none">{word.hanzi}</p>
        {word.traditional && word.traditional !== word.simplified && (
          <p className="text-sm text-gray-500">
            Phồn thể: <span className="font-hanzi text-lg">{word.traditional}</span>
          </p>
        )}
        <LangDisplay word={word} showPrimary showSecondary showPinyin />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {word.hskLevel && (
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-xs text-gray-500 mb-1">Cấp độ</p>
            <p className="text-gray-200 font-medium">HSK {word.hskLevel}</p>
          </div>
        )}
        {word.strokeCount && (
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-xs text-gray-500 mb-1">Số nét</p>
            <p className="text-gray-200 font-medium">{word.strokeCount} nét</p>
          </div>
        )}
        {word.radicals.length > 0 && (
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-xs text-gray-500 mb-1">Bộ thủ</p>
            <p className="font-hanzi text-lg text-gray-200">{word.radicals.join(' ')}</p>
          </div>
        )}
        {word.topics.length > 0 && (
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-xs text-gray-500 mb-1">Chủ đề</p>
            <p className="text-gray-200 text-xs">{word.topics.join(', ')}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface-2 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bộ thẻ cá nhân</h2>
          <NavLink to="/decks" className="text-xs text-pinyin hover:text-white transition-colors">
            Quản lý
          </NavLink>
        </div>
        {customDecks.length === 0 ? (
          <p className="text-sm text-gray-500">Tạo bộ thẻ riêng ở trang Bộ thẻ rồi quay lại đây để thêm từ.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {customDecks.map((deck) => {
              const included = deck.wordIds.includes(word.id)
              return (
                <button
                  key={deck.id}
                  onClick={() => included ? removeWord(deck.id, word.id) : addWord(deck.id, word.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    included
                      ? 'border-pinyin bg-pinyin/10 text-pinyin'
                      : 'border-border text-gray-400 hover:border-pinyin hover:text-pinyin'
                  }`}
                >
                  {included ? `Đã thêm · ${deck.name}` : `Thêm vào · ${deck.name}`}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {word.examples.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ví dụ</h2>
          {word.examples.map((example, index) => (
            <div key={`${example.zh}-${index}`} className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="font-hanzi text-xl text-gray-200">{example.zh}</p>
              {showPinyin && example.pinyin && <p className="text-xs text-pinyin mt-0.5">{example.pinyin}</p>}
              {example.vi && <p className="text-sm text-vi mt-1">{example.vi}</p>}
              {example.en && <p className="text-sm text-en mt-0.5">{example.en}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Luyện viết</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {chars.map((char, index) => (
            <div key={`${char}-${index}`} className="flex-shrink-0">
              <WritingCanvas char={char} checkMode={writingCheckMode} />
              {chars.length > 1 && (
                <p className="text-center text-xs text-gray-600 mt-1 font-hanzi">{char}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <NavLink
          to={`/flashcards?word=${word.id}`}
          className="flex-1 py-3 rounded-xl border border-pinyin/50 text-pinyin text-sm text-center hover:bg-pinyin/10 transition-colors"
        >
          Flashcard
        </NavLink>
        <NavLink
          to={`/write?word=${word.id}`}
          className="flex-1 py-3 rounded-xl border border-border text-gray-400 text-sm text-center hover:border-gray-500 transition-colors"
        >
          Luyện viết
        </NavLink>
      </div>
    </div>
  )
}
