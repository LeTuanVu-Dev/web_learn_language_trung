import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { allWords, wordById } from '../data'
import { FlashCard } from '../components/FlashCard'
import { WordEntry } from '../types'
import { getDeckWords } from '../store/decks'
import { useSettings } from '../store/settings'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
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

  const words: WordEntry[] = useMemo(() => {
    if (wordParam) {
      const word = wordById.get(wordParam)
      return word ? [word] : []
    }

    const pool = deckParam === 'hsk1'
      ? allWords.filter((word) => word.hskLevel === 1)
      : getDeckWords(deckParam, allWords)
    const eligible = lang === 'en' ? pool.filter((word) => word.meaningsEn.length > 0) : pool
    return shuffle(eligible)
  }, [wordParam, deckParam, lang])

  const [index, setIndex] = useState(0)
  const [known, setKnown] = useState<Set<number>>(new Set())
  const [done, setDone] = useState(false)

  const word = words[index]
  const progress = words.length ? (index / words.length) * 100 : 0

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
      <div className="py-8 text-center text-gray-500">
        <p>Không có từ nào trong bộ thẻ này.</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="py-8 flex flex-col items-center gap-6 animate-slide-up">
        <div className="font-hanzi text-5xl text-hanzi">完成</div>
        <div className="text-center">
          <p className="text-gray-200 text-lg font-medium">Hoàn thành</p>
          <p className="text-gray-400 text-sm mt-1">
            Đã nhớ: <span className="text-green-400">{known.size}</span> / {words.length} từ
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={restart}
            className="w-full py-3 rounded-xl bg-pinyin/10 border border-pinyin/50 text-pinyin text-sm font-medium hover:bg-pinyin/20 transition-colors"
          >
            Học lại từ đầu
          </button>
          {known.size < words.length && (
            <button
              onClick={() => {
                setIndex(0)
                setDone(false)
              }}
              className="w-full py-3 rounded-xl border border-border text-gray-400 text-sm hover:border-gray-500 transition-colors"
            >
              Chỉ học từ chưa nhớ ({words.length - known.size})
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{index + 1} / {words.length}</span>
        <span className="text-green-500">{known.size} đã nhớ</span>
      </div>

      <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
        <div
          className="h-full bg-hanzi/60 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {word && <FlashCard word={word} onNext={handleNext} showWriteLink />}
    </div>
  )
}
