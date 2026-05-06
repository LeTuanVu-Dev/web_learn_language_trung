import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QuizCard } from '../components/QuizCard'
import { generateQuiz } from '../utils/quiz-generator'
import { QuizQuestion, SessionResult } from '../types'
import { useSettings } from '../store/settings'
import { getDeckWords } from '../store/decks'
import { useVocabularyStore } from '../store/vocabulary'

export function Quiz() {
  const [params] = useSearchParams()
  const deckParam = params.get('deck') ?? 'hsk1'
  const { primaryLanguage: lang } = useSettings()
  const allWords = useVocabularyStore((state) => state.words)

  const pool = useMemo(() => {
    const words = getDeckWords(deckParam, allWords)
    return lang === 'en' ? words.filter((word) => word.meaningsEn.length > 0) : words
  }, [deckParam, lang, allWords])

  const [questions, setQuestions] = useState<QuizQuestion[]>(() => generateQuiz(pool, allWords, lang, 15))
  const [qIndex, setQIndex] = useState(0)
  const [results, setResults] = useState<SessionResult[]>([])
  const [done, setDone] = useState(false)

  const wordMap = useMemo(() => new Map(allWords.map((word) => [word.id, word])), [allWords])

  useEffect(() => {
    setQuestions(generateQuiz(pool, allWords, lang, 15))
    setQIndex(0)
    setResults([])
    setDone(false)
  }, [pool, allWords, lang, deckParam])

  function handleAnswer(correct: boolean) {
    const question = questions[qIndex]
    const nextResults = [
      ...results,
      {
        wordId: question.wordId,
        correct,
        attempts: 1,
        timeMs: 0,
      },
    ]

    setResults(nextResults)

    const next = qIndex + 1
    if (next >= questions.length) setDone(true)
    else setQIndex(next)
  }

  function restart() {
    setQuestions(generateQuiz(pool, allWords, lang, 15))
    setQIndex(0)
    setResults([])
    setDone(false)
  }

  const progress = questions.length ? (qIndex / questions.length) * 100 : 0
  const correctCount = results.filter((result) => result.correct).length

  if (done) {
    const pct = Math.round((correctCount / results.length) * 100)
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="font-hanzi text-5xl text-hanzi">{pct >= 80 ? '优秀' : pct >= 60 ? '良好' : '加油'}</div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">{pct}% chinh xac</p>
          <p className="mt-1 text-sm text-gray-700">
            Dung: <span className="text-green-600">{correctCount}</span> / {results.length}
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2">
          {results.map((result, index) => {
            const question = questions[index]
            const word = wordMap.get(question?.wordId ?? '')
            if (!word) return null

            const meaning = lang === 'vi'
              ? (word.meaningsVi[0] ?? word.meaningsEn[0] ?? '')
              : (word.meaningsEn[0] ?? word.meaningsVi[0] ?? '')

            return (
              <div
                key={`${result.wordId}-${index}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  result.correct ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <span className={result.correct ? 'text-green-600' : 'text-red-600'}>
                  {result.correct ? '✓' : '✕'}
                </span>
                <span className="w-10 font-hanzi text-xl text-hanzi">{word.hanzi}</span>
                <span className="truncate text-gray-800">{meaning}</span>
              </div>
            )
          })}
        </div>

        <button
          onClick={restart}
          className="w-full max-w-xs rounded-xl border border-pinyin/50 bg-pinyin/10 py-3 text-sm font-medium text-pinyin transition-colors hover:bg-pinyin/20"
        >
          Lam lai
        </button>
      </div>
    )
  }

  const current = questions[qIndex]
  if (!current) return null

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Cau {qIndex + 1} / {questions.length}</span>
        <span className="text-green-600">{correctCount} dung</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full bg-pinyin/60 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <QuizCard key={current.id} question={current} wordMap={wordMap} onAnswer={handleAnswer} />
    </div>
  )
}
