import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { WordEntry } from '../types'
import { useSettings } from '../store/settings'
import { useVocabularyStore } from '../store/vocabulary'

export function Library() {
  const [search, setSearch] = useState('')
  const [hskFilter, setHskFilter] = useState<number | 'all'>('all')
  const [topicFilter, setTopicFilter] = useState<string | 'all'>('all')
  const { primaryLanguage: lang } = useSettings()
  const { words, officialTopics } = useVocabularyStore((state) => ({
    words: state.words,
    officialTopics: state.officialTopics,
  }))

  const levels = useMemo(() => {
    const hskLevels = new Set<number>()
    words.forEach((word) => {
      if (word.hskLevel) hskLevels.add(word.hskLevel)
    })
    return Array.from(hskLevels).sort((a, b) => a - b)
  }, [words])

  const filtered = useMemo(() => {
    let list = words

    if (hskFilter !== 'all') list = list.filter((word) => word.hskLevel === hskFilter)
    if (topicFilter !== 'all') list = list.filter((word) => word.topics.includes(topicFilter))

    if (search.trim()) {
      const query = search.trim().toLowerCase()
      list = list.filter((word) =>
        word.hanzi.includes(query) ||
        word.pinyin.toLowerCase().includes(query) ||
        word.meaningsVi.some((meaning) => meaning.toLowerCase().includes(query)) ||
        word.meaningsEn.some((meaning) => meaning.toLowerCase().includes(query)),
      )
    }

    return list
  }, [words, hskFilter, topicFilter, search])

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Thu vien</h1>
        <span className="text-sm text-gray-600">{filtered.length} tu</span>
      </div>

      <input
        type="search"
        placeholder="Tim chu, pinyin, nghia..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-pinyin"
      />

      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        {(['all', ...levels] as const).map((level) => (
          <button
            key={level}
            onClick={() => setHskFilter(level)}
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              hskFilter === level
                ? 'border-hanzi bg-hanzi/10 text-hanzi'
                : 'border-border text-gray-700 hover:border-gray-500'
            }`}
          >
            {level === 'all' ? 'Tat ca' : `HSK ${level}`}
          </button>
        ))}

        <div className="w-px flex-shrink-0 bg-border" />

        {officialTopics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setTopicFilter(topicFilter === topic.name ? 'all' : topic.name)}
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              topicFilter === topic.name
                ? 'border-pinyin bg-pinyin/10 text-pinyin'
                : 'border-border text-gray-700 hover:border-gray-500'
            }`}
          >
            {topic.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {filtered.map((word) => (
          <WordRow key={word.id} word={word} lang={lang} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-600">Khong tim thay muc tu phu hop.</p>
        )}
      </div>
    </div>
  )
}

function WordRow({ word, lang }: { word: WordEntry; lang: string }) {
  const meanings = lang === 'vi'
    ? (word.meaningsVi.length > 0 ? word.meaningsVi : word.meaningsEn)
    : (word.meaningsEn.length > 0 ? word.meaningsEn : word.meaningsVi)

  return (
    <NavLink
      to={`/character/${word.id}`}
      className="flex items-center gap-4 rounded-xl border border-transparent px-3 py-2.5 transition-all hover:border-border hover:bg-white active:scale-[0.98]"
    >
      <span className="w-12 flex-shrink-0 text-center font-hanzi text-3xl leading-none text-hanzi">
        {word.hanzi}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-pinyin">{word.pinyin || '—'}</p>
        <p className="truncate text-sm text-gray-800">{meanings.join('；')}</p>
      </div>
      {word.hskLevel && (
        <span className="flex-shrink-0 rounded border border-gray-300 px-1 text-[10px] text-gray-600">
          HSK{word.hskLevel}
        </span>
      )}
    </NavLink>
  )
}
