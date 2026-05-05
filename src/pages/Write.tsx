import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { allWords, wordById } from '../data'
import { WritingCanvas } from '../components/WritingCanvas'
import { LangDisplay } from '../components/LangDisplay'
import { WordEntry } from '../types'
import { useSettings } from '../store/settings'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function Write() {
  const [params] = useSearchParams()
  const wordParam = params.get('word')
  const { writingCheckMode, primaryLanguage } = useSettings()

  const words: WordEntry[] = useMemo(() => {
    if (wordParam) {
      const word = wordById.get(wordParam)
      return word ? [word] : []
    }
    return shuffle(allWords.filter((word) => word.hskLevel === 1))
  }, [wordParam])

  const [index, setIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [completedMistakes, setCompletedMistakes] = useState<number | null>(null)

  const word = words[index]
  if (!word) return <div className="py-8 text-center text-gray-500">Không có dữ liệu.</div>

  const chars = Array.from(word.simplified)
  const currentChar = chars[charIndex] ?? chars[0]
  const promptMeaning =
    primaryLanguage === 'en'
      ? word.meaningsEn[0] ?? word.meaningsVi[0] ?? ''
      : word.meaningsVi[0] ?? word.meaningsEn[0] ?? ''

  function handleCharComplete(mistakes: number) {
    setCompletedMistakes(mistakes)
    setRevealed(true)
  }

  function nextChar() {
    if (charIndex < chars.length - 1) {
      setCharIndex((value) => value + 1)
      setRevealed(false)
      setCompletedMistakes(null)
    }
  }

  function nextWord() {
    setIndex((value) => (value + 1) % words.length)
    setCharIndex(0)
    setRevealed(false)
    setCompletedMistakes(null)
  }

  return (
    <div className="py-4 flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Luyện viết</span>
        <span>{index + 1} / {words.length}</span>
      </div>

      <div className="rounded-2xl border border-border bg-surface-2 p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Prompt</p>
            <p className="text-2xl text-gray-200 font-semibold mt-1">{promptMeaning}</p>
            <p className="text-xs text-gray-600 mt-2">
              Tự nhớ chữ Trung, viết xong rồi bấm <span className="font-medium">Confirm</span> để chấm.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Tiến độ chữ</p>
            <p className="font-hanzi text-2xl text-hanzi mt-1">{chars.length > 1 ? `${charIndex + 1}/${chars.length}` : '1/1'}</p>
          </div>
        </div>
      </div>

      <WritingCanvas
        key={`${word.id}-${charIndex}`}
        char={currentChar}
        checkMode={writingCheckMode}
        onComplete={handleCharComplete}
        concealCharacter
      />

      {revealed && (
        <div className={`rounded-2xl border p-4 animate-slide-up ${
          completedMistakes === 0
            ? 'border-green-300 bg-green-50'
            : 'border-red-300 bg-red-50'
        }`}>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-hanzi text-3xl text-hanzi">{word.hanzi}</span>
            {word.traditional && word.traditional !== word.simplified && (
              <span className="font-hanzi text-xl text-gray-500">{word.traditional}</span>
            )}
            {completedMistakes !== null && (
              <span className={`text-sm font-medium ${completedMistakes === 0 ? 'text-green-700' : 'text-red-700'}`}>
                {completedMistakes === 0 ? 'Đúng chuẩn' : `${completedMistakes} lỗi`}
              </span>
            )}
          </div>
          <LangDisplay word={word} showPrimary showSecondary showPinyin />

          {word.examples.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="font-hanzi text-base text-gray-900">{word.examples[0].zh}</p>
              {word.examples[0].pinyin && (
                <p className="text-xs text-pinyin">{word.examples[0].pinyin}</p>
              )}
              <p className="text-sm text-gray-700 mt-0.5">{word.examples[0].vi ?? word.examples[0].en}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {chars.length > 1 && charIndex < chars.length - 1 && revealed && (
          <button onClick={nextChar} className="flex-1 py-3 rounded-xl border border-pinyin/50 text-pinyin text-sm hover:bg-pinyin/10 transition-colors bg-white">
            Chữ tiếp theo
          </button>
        )}
        <button onClick={nextWord} className="flex-1 py-3 rounded-xl border border-border text-gray-700 text-sm hover:border-gray-500 transition-colors bg-white">
          Từ tiếp theo
        </button>
      </div>
    </div>
  )
}
