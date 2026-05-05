import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useDecks } from '../store/decks'

export function Decks() {
  const { decks, createDeck, deleteDeck } = useDecks()
  const [newName, setNewName] = useState('')

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    createDeck(name)
    setNewName('')
  }

  return (
    <div className="py-4 flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-gray-200">Bộ thẻ</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tên bộ thẻ mới..."
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleCreate()}
          className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-pinyin transition-colors"
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-pinyin/10 border border-pinyin/50 text-pinyin hover:bg-pinyin/20 disabled:opacity-40 transition-colors"
        >
          Tạo
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="rounded-xl border border-border bg-surface-2 p-4 flex items-center gap-3"
          >
            <div className="flex-1">
              <p className="text-sm text-gray-200 font-medium">{deck.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {deck.isCustom ? `${deck.wordIds.length} từ` : 'Bộ có sẵn'}
              </p>
            </div>
            <div className="flex gap-2">
              <NavLink
                to={`/flashcards?deck=${deck.id}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-pinyin/40 text-pinyin hover:bg-pinyin/10 transition-colors"
              >
                Flashcard
              </NavLink>
              <NavLink
                to={`/quiz?deck=${deck.id}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-border text-gray-400 hover:border-gray-500 transition-colors"
              >
                Quiz
              </NavLink>
              {deck.isCustom && (
                <button
                  onClick={() => deleteDeck(deck.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 text-center">
        Thêm từ vào bộ thẻ riêng từ trang chi tiết của từng từ.
      </p>
    </div>
  )
}
