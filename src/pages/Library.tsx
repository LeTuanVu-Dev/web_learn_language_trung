import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { allWords, getAllTopics, getHskLevels } from '../data'
import { WordEntry } from '../types'
import { useSettings } from '../store/settings'

export function Library() {
  const [search, setSearch] = useState('')
  const [hskFilter, setHskFilter] = useState<number | 'all'>('all')
  const [topicFilter, setTopicFilter] = useState<string | 'all'>('all')
  const { primaryLanguage: lang, showPinyin } = useSettings()
  const topics = useMemo(() => getAllTopics(), [])
  const levels = useMemo(() => getHskLevels(), [])

  const filtered = useMemo(() => {
    let words = allWords

    if (hskFilter !== 'all') words = words.filter((word) => word.hskLevel === hskFilter)
    if (topicFilter !== 'all') words = words.filter((word) => word.topics.includes(topicFilter))

    if (search.trim()) {
      const query = search.trim().toLowerCase()
      words = words.filter((word) =>
        word.hanzi.includes(query) ||
        word.pinyin.toLowerCase().includes(query) ||
        word.meaningsVi.some((meaning) => meaning.toLowerCase().includes(query)) ||
        word.meaningsEn.some((meaning) => meaning.toLowerCase().includes(query)),
      )
    }

    return words
  }, [search, hskFilter, topicFilter])

  return (
    <div className="py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-200">Thư viện</h1>
        <span className="text-sm text-gray-500">{filtered.length} từ</span>
      </div>

      <input
        type="search"
        placeholder="Tìm chữ, pinyin, nghĩa..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-pinyin transition-colors"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(['all', ...levels] as const).map((level) => (
          <button
            key={level}
            onClick={() => setHskFilter(level)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
              hskFilter === level
                ? 'border-hanzi bg-hanzi/10 text-hanzi'
                : 'border-border text-gray-500 hover:border-gray-500'
            }`}
          >
            {level === 'all' ? 'Tất cả' : `HSK ${level}`}
          </button>
        ))}

        <div className="w-px bg-border flex-shrink-0" />

        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => setTopicFilter(topic === topicFilter ? 'all' : topic)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
              topicFilter === topic
                ? 'border-pinyin bg-pinyin/10 text-pinyin'
                : 'border-border text-gray-500 hover:border-gray-500'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {filtered.map((word) => (
          <WordRow key={word.id} word={word} lang={lang} showPinyin={showPinyin} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-600 py-8 text-sm">Không tìm thấy mục từ phù hợp.</p>
        )}
      </div>
    </div>
  )
}

function WordRow({ word, lang, showPinyin }: { word: WordEntry; lang: string; showPinyin: boolean }) {
  const meanings = lang === 'vi'
    ? (word.meaningsVi.length > 0 ? word.meaningsVi : word.meaningsEn)
    : (word.meaningsEn.length > 0 ? word.meaningsEn : word.meaningsVi)

  return (
    <NavLink
      to={`/character/${word.id}`}
      className="flex items-center gap-4 rounded-xl border border-transparent hover:border-border hover:bg-surface-2 px-3 py-2.5 transition-all active:scale-[0.98]"
    >
      <span className="font-hanzi text-3xl text-hanzi w-12 text-center flex-shrink-0 leading-none">
        {word.hanzi}
      </span>
      <div className="flex-1 min-w-0">
        {showPinyin && <p className="text-xs text-pinyin">{word.pinyin}</p>}
        <p className="text-sm text-gray-300 truncate">{meanings.join('；')}</p>
      </div>
      {word.hskLevel && (
        <span className="text-[10px] border border-gray-700 rounded px-1 text-gray-600 flex-shrink-0">
          HSK{word.hskLevel}
        </span>
      )}
    </NavLink>
  )
}
