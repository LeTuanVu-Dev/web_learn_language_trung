import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FlashCard } from '../components/FlashCard'
import { WordEntry } from '../types'
import { getDeckWords } from '../store/decks'
import { useSettings } from '../store/settings'
import { useVocabularyStore } from '../store/vocabulary'

function shuffle<T>(items: T[]) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function Flashcards() {
  const [params] = useSearchParams()
  const wordParam = params.get('word')
  const deckParam = params.get('deck') ?? 'hsk1'
  const { primaryLanguage: lang } = useSettings()
  const allWords = useVocabularyStore((state) => state.words)

  const words: WordEntry[] = useMemo(() => {
    if (wordParam) {
      const word = allWords.find((entry) => entry.id === wordParam)
      return word ? [word] : []
    }

    const pool = getDeckWords(deckParam, allWords)
    const eligible = lang === 'en' ? pool.filter((word) => word.meaningsEn.length > 0) : pool
    return shuffle(eligible)
  }, [wordParam, deckParam, lang, allWords])

  const [index, setIndex] = useState(0)
  const [known, setKnown] = useState<Set<number>>(new Set())
  const [done, setDone] = useState(false)

  const word = words[index]
  const progress = words.length ? (index / words.length) * 100 : 0

  useEffect(() => {
    setIndex(0)
    setKnown(new Set())
    setDone(false)
  }, [deckParam, wordParam, lang, words.length])

  function handleNext(isKnown: boolean) {
    if (isKnown) {
      setKnown((current) => new Set(current).add(index))
    }

    const next = index + 1
    if (next >= words.length) setDone(true)
    else setIndex(next)
  }

  function restart() {
    setIndex(0)
    setKnown(new Set())
    setDone(false)
  }

  if (!words.length) {
    return (
      <div className="py-8 text-center text-gray-600">
        <p>Khong co tu nao trong bo the nay.</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="font-hanzi text-5xl text-hanzi">完成</div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Hoan thanh</p>
          <p className="mt-1 text-sm text-gray-700">
            Da nho: <span className="text-green-600">{known.size}</span> / {words.length} tu
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={restart}
            className="w-full rounded-xl border border-pinyin/50 bg-pinyin/10 py-3 text-sm font-medium text-pinyin transition-colors hover:bg-pinyin/20"
          >
            Hoc lai tu dau
          </button>
          {known.size < words.length && (
            <button
              onClick={() => {
                setIndex(0)
                setDone(false)
              }}
              className="w-full rounded-xl border border-border py-3 text-sm text-gray-800 transition-colors hover:border-gray-500"
            >
              Chi hoc tu chua nho ({words.length - known.size})
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{index + 1} / {words.length}</span>
        <span className="text-green-600">{known.size} da nho</span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-hanzi/70 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {word && <FlashCard word={word} onNext={handleNext} showWriteLink />}
    </div>
  )
}
