import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { WritingCanvas } from '../components/WritingCanvas'
import { LangDisplay } from '../components/LangDisplay'
import { WordEntry, WritingScoreResult } from '../types'
import { useSettings } from '../store/settings'
import { useVocabularyStore } from '../store/vocabulary'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function Write() {
  const [params] = useSearchParams()
  const wordParam = params.get('word')
  const { primaryLanguage } = useSettings()
  const isVi = primaryLanguage === 'vi'
  const allWords = useVocabularyStore((state) => state.words)

  const words: WordEntry[] = useMemo(() => {
    if (wordParam) {
      const word = allWords.find((entry) => entry.id === wordParam)
      return word ? [word] : []
    }
    return shuffle(allWords.filter((word) => (word.hskLevel ?? 0) <= 5))
  }, [wordParam, allWords])

  const [index, setIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [result, setResult] = useState<WritingScoreResult | null>(null)

  const word = words[index]
  if (!word) return <div className="py-8 text-center text-gray-600">{isVi ? 'Không có dữ liệu.' : 'No data.'}</div>

  const chars = Array.from(word.simplified)
  const currentChar = chars[charIndex] ?? chars[0]
  const promptMeaning =
    primaryLanguage === 'en'
      ? word.meaningsEn[0] ?? word.meaningsVi[0] ?? ''
      : word.meaningsVi[0] ?? word.meaningsEn[0] ?? ''

  useEffect(() => {
    setIndex(0)
    setCharIndex(0)
    setRevealed(false)
    setResult(null)
  }, [wordParam, words.length])

  function handleCharComplete(nextResult: WritingScoreResult) {
    setResult(nextResult)
    setRevealed(true)
  }

  function nextChar() {
    if (charIndex < chars.length - 1) {
      setCharIndex((value) => value + 1)
      setRevealed(false)
      setResult(null)
    }
  }

  function nextWord() {
    setIndex((value) => (value + 1) % words.length)
    setCharIndex(0)
    setRevealed(false)
    setResult(null)
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{isVi ? 'Luyện viết' : 'Writing'}</span>
        <span>{index + 1} / {words.length}</span>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600">Prompt</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{promptMeaning}</p>
            <p className="mt-2 text-xs text-gray-600">
              {isVi ? 'Từ nhớ chữ Trung, viết xong bấm ' : 'Write the Chinese character from memory, then press '}
              <span className="font-medium">{isVi ? 'Chấm bài' : 'Check'}</span>
              {isVi ? ' để xem độ giống.' : ' to see similarity.'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600">{isVi ? 'Tiến độ chữ' : 'Character'}</p>
            <p className="mt-1 font-hanzi text-2xl text-hanzi">{chars.length > 1 ? `${charIndex + 1}/${chars.length}` : '1/1'}</p>
          </div>
        </div>
      </div>

      <WritingCanvas
        key={`${word.id}-${charIndex}`}
        char={currentChar}
        onComplete={handleCharComplete}
        concealCharacter
      />

      {revealed && result && (
        <div className={`animate-slide-up rounded-2xl border p-4 ${
          result.status === 'excellent'
            ? 'border-green-300 bg-green-50'
            : result.status === 'good'
              ? 'border-amber-300 bg-amber-50'
              : 'border-red-300 bg-red-50'
        }`}>
          <div className="mb-3 flex items-baseline gap-2">
            <span className="font-hanzi text-3xl text-hanzi">{word.hanzi}</span>
            {word.traditional && word.traditional !== word.simplified && (
              <span className="font-hanzi text-xl text-gray-600">{word.traditional}</span>
            )}
            <span className={`text-sm font-medium ${
              result.status === 'excellent'
                ? 'text-green-700'
                : result.status === 'good'
                  ? 'text-amber-700'
                  : 'text-red-700'
            }`}>
              {result.similarityPct}% {isVi ? 'tương đồng' : 'similar'}
            </span>
          </div>
          <LangDisplay word={word} showPrimary showSecondary showPinyin />

          {word.examples.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="font-hanzi text-base text-gray-900">{word.examples[0].zh}</p>
              {word.examples[0].pinyin && (
                <p className="text-xs text-pinyin">{word.examples[0].pinyin}</p>
              )}
              <p className="mt-0.5 text-sm text-gray-800">
                {isVi
                  ? (word.examples[0].vi ?? word.examples[0].en)
                  : (word.examples[0].en ?? word.examples[0].vi)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {chars.length > 1 && charIndex < chars.length - 1 && revealed && (
          <button
            onClick={nextChar}
            className="flex-1 rounded-xl border border-pinyin/50 bg-white py-3 text-sm text-pinyin transition-colors hover:bg-pinyin/10"
          >
            {isVi ? 'Chữ tiếp theo' : 'Next character'}
          </button>
        )}
        <button
          onClick={nextWord}
          className="flex-1 rounded-xl border border-border bg-white py-3 text-sm text-gray-800 transition-colors hover:border-gray-500"
        >
          {isVi ? 'Từ tiếp theo' : 'Next word'}
        </button>
      </div>
    </div>
  )
}
