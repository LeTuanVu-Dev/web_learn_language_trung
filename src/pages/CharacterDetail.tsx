import { NavLink, useParams } from 'react-router-dom'
import { LangDisplay } from '../components/LangDisplay'
import { WritingCanvas } from '../components/WritingCanvas'
import { useSettings } from '../store/settings'
import { useDecks } from '../store/decks'
import { useVocabularyStore } from '../store/vocabulary'

export function CharacterDetail() {
  const { id } = useParams<{ id: string }>()
  const word = useVocabularyStore((state) => state.words.find((entry) => entry.id === id))
  const { showPinyin } = useSettings()
  const { decks, addWord, removeWord } = useDecks()

  if (!word) {
    return (
      <div className="py-8 text-center text-gray-600">
        <p>Khong tim thay tu.</p>
        <NavLink to="/library" className="mt-2 block text-sm text-pinyin">← Ve thu vien</NavLink>
      </div>
    )
  }

  const chars = Array.from(word.simplified)
  const customDecks = decks.filter((deck) => deck.isCustom)

  return (
    <div className="flex flex-col gap-6 py-4">
      <NavLink to="/library" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
        ← Thu vien
      </NavLink>

      <div className="flex flex-col items-center gap-2">
        <p className="font-hanzi text-8xl leading-none text-hanzi">{word.hanzi}</p>
        {word.traditional && word.traditional !== word.simplified && (
          <p className="text-sm text-gray-600">
            Phon the: <span className="font-hanzi text-lg">{word.traditional}</span>
          </p>
        )}
        <LangDisplay word={word} showPrimary showSecondary showPinyin />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {word.hskLevel && (
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="mb-1 text-xs text-gray-600">Cap do</p>
            <p className="font-medium text-gray-900">HSK {word.hskLevel}</p>
          </div>
        )}
        {word.strokeCount && (
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="mb-1 text-xs text-gray-600">So net</p>
            <p className="font-medium text-gray-900">{word.strokeCount} net</p>
          </div>
        )}
        {word.radicals.length > 0 && (
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="mb-1 text-xs text-gray-600">Bo thu</p>
            <p className="font-hanzi text-lg text-gray-900">{word.radicals.join(' ')}</p>
          </div>
        )}
        {word.topics.length > 0 && (
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="mb-1 text-xs text-gray-600">Chu de</p>
            <p className="text-xs text-gray-800">{word.topics.join(', ')}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-600">Bo the ca nhan</h2>
          <NavLink to="/decks" className="text-xs text-pinyin transition-colors hover:text-blue-700">
            Quan ly
          </NavLink>
        </div>
        {customDecks.length === 0 ? (
          <p className="text-sm text-gray-700">Tao bo the rieng o trang Bo the roi quay lai day de them tu.</p>
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
                      : 'border-border text-gray-700 hover:border-pinyin hover:text-pinyin'
                  }`}
                >
                  {included ? `Da them · ${deck.name}` : `Them vao · ${deck.name}`}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {word.examples.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-600">Vi du</h2>
          {word.examples.map((example, index) => (
            <div key={`${example.zh}-${index}`} className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="font-hanzi text-xl text-gray-900">{example.zh}</p>
              {showPinyin && example.pinyin && <p className="mt-0.5 text-xs text-pinyin">{example.pinyin}</p>}
              {example.vi && <p className="mt-1 text-sm text-gray-800">{example.vi}</p>}
              {example.en && <p className="mt-0.5 text-sm text-gray-700">{example.en}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-600">Luyen viet</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {chars.map((char, index) => (
            <div key={`${char}-${index}`} className="flex-shrink-0">
              <WritingCanvas char={char} />
              {chars.length > 1 && (
                <p className="mt-1 text-center font-hanzi text-xs text-gray-600">{char}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <NavLink
          to={`/flashcards?word=${word.id}`}
          className="flex-1 rounded-xl border border-pinyin/50 py-3 text-center text-sm text-pinyin transition-colors hover:bg-pinyin/10"
        >
          Flashcard
        </NavLink>
        <NavLink
          to={`/write?word=${word.id}`}
          className="flex-1 rounded-xl border border-border py-3 text-center text-sm text-gray-800 transition-colors hover:border-gray-500"
        >
          Luyen viet
        </NavLink>
      </div>
    </div>
  )
}
