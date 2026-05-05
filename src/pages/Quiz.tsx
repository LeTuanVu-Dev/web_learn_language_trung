import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { allWords } from '../data'
import { QuizCard } from '../components/QuizCard'
import { generateQuiz } from '../utils/quiz-generator'
import { QuizQuestion, SessionResult } from '../types'
import { useSettings } from '../store/settings'

export function Quiz() {
  const [params] = useSearchParams()
  const deckParam = params.get('deck') ?? 'hsk1'
  const { primaryLanguage: lang } = useSettings()

  const pool = useMemo(() => {
    const words = deckParam === 'hsk1'
      ? allWords.filter((word) => word.hskLevel === 1)
      : allWords
    return lang === 'en' ? words.filter((word) => word.meaningsEn.length > 0) : words
  }, [deckParam, lang])

  const [questions, setQuestions] = useState<QuizQuestion[]>(() => generateQuiz(pool, pool, lang, 15))
  const [qIndex, setQIndex] = useState(0)
  const [results, setResults] = useState<SessionResult[]>([])
  const [done, setDone] = useState(false)

  const wordMap = useMemo(() => new Map(allWords.map((word) => [word.id, word])), [])

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
    setQuestions(generateQuiz(pool, pool, lang, 15))
    setQIndex(0)
    setResults([])
    setDone(false)
  }

  const progress = questions.length ? (qIndex / questions.length) * 100 : 0
  const correctCount = results.filter((result) => result.correct).length

  if (done) {
    const pct = Math.round((correctCount / results.length) * 100)
    return (
      <div className="py-8 flex flex-col items-center gap-6 animate-slide-up">
        <div className="font-hanzi text-5xl text-hanzi">{pct >= 80 ? '优秀' : pct >= 60 ? '良好' : '加油'}</div>
        <div className="text-center">
          <p className="text-gray-200 text-lg font-medium">{pct}% chính xác</p>
          <p className="text-gray-400 text-sm mt-1">
            Đúng: <span className="text-green-400">{correctCount}</span> / {results.length}
          </p>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-2">
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  result.correct ? 'bg-green-900/20' : 'bg-red-900/20'
                }`}
              >
                <span className={result.correct ? 'text-green-400' : 'text-red-400'}>
                  {result.correct ? '✓' : '✕'}
                </span>
                <span className="font-hanzi text-xl text-hanzi w-10">{word.hanzi}</span>
                <span className="text-gray-400 truncate">{meaning}</span>
              </div>
            )
          })}
        </div>

        <button
          onClick={restart}
          className="w-full max-w-xs py-3 rounded-xl bg-pinyin/10 border border-pinyin/50 text-pinyin text-sm font-medium hover:bg-pinyin/20 transition-colors"
        >
          Làm lại
        </button>
      </div>
    )
  }

  const current = questions[qIndex]
  if (!current) return null

  return (
    <div className="py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Câu {qIndex + 1} / {questions.length}</span>
        <span className="text-green-400">{correctCount} đúng</span>
      </div>
      <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
        <div className="h-full bg-pinyin/60 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <QuizCard key={current.id} question={current} wordMap={wordMap} onAnswer={handleAnswer} />
    </div>
  )
}
