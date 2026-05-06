import { useState } from 'react'
import { QuizQuestion, WordEntry } from '../types'
import { useSettings } from '../store/settings'

interface Props {
  question: QuizQuestion
  wordMap: Map<string, WordEntry>
  onAnswer: (correct: boolean) => void
}

type State = 'unanswered' | 'correct' | 'wrong'

export function QuizCard({ question, wordMap, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [state, setState] = useState<State>('unanswered')
  const [showHintPinyin, setShowHintPinyin] = useState(false)
  const { showPinyin, showSecondaryLanguage } = useSettings()

  const word = wordMap.get(question.wordId)
  const isHanziPrompt = question.type === 'meaning-from-hanzi'

  function choose(choiceId: string) {
    if (state !== 'unanswered') return
    const correct = choiceId === question.correctId
    setSelected(choiceId)
    setState(correct ? 'correct' : 'wrong')
    setTimeout(() => onAnswer(correct), 900)
  }

  function choiceClass(id: string) {
    if (state === 'unanswered') {
      return 'border-border bg-surface-2 text-gray-900 hover:border-pinyin active:scale-[0.97]'
    }
    if (id === question.correctId) return 'border-green-500 bg-green-50 text-gray-900'
    if (id === selected) return 'border-red-500 bg-red-50 text-gray-900'
    return 'border-border bg-surface-2 text-gray-500 opacity-75'
  }

  const revealPinyin = showPinyin && (showHintPinyin || state !== 'unanswered')

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5 animate-slide-up">
      <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface-2 p-6">
        {isHanziPrompt ? (
          <>
            <p className="font-hanzi text-6xl leading-none text-hanzi">{question.promptHanzi}</p>
            {revealPinyin && question.promptPinyin && (
              <p className="font-ui text-base text-pinyin">{question.promptPinyin}</p>
            )}
            <p className="mt-1 text-xs text-gray-600">
              {question.lang === 'vi' ? 'Chon nghia dung' : 'Choose the correct meaning'}
            </p>
            {showPinyin && state === 'unanswered' && (
              <button
                onClick={() => setShowHintPinyin((value) => !value)}
                className="rounded-full border border-pinyin/30 px-3 py-1 text-xs text-pinyin hover:bg-pinyin/10"
              >
                {showHintPinyin ? 'An pinyin' : 'Goi y pinyin'}
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-center font-ui text-lg text-gray-900">{question.prompt}</p>
            {revealPinyin && word?.pinyin && (
              <p className="text-sm text-pinyin">{word.pinyin}</p>
            )}
            <p className="mt-1 text-xs text-gray-600">
              {question.lang === 'vi' ? 'Chon chu Han dung' : 'Pick the matching hanzi'}
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => choose(choice.id)}
            className={`rounded-xl border p-3 text-center transition-all duration-150 ${
              choice.hanzi ? 'font-hanzi text-3xl' : 'font-ui text-sm leading-tight'
            } ${choiceClass(choice.id)}`}
          >
            {choice.hanzi ?? choice.text}
            {state !== 'unanswered' && choice.id === question.correctId && !choice.hanzi && (
              <span className="mt-0.5 block text-xs text-green-600">✓</span>
            )}
          </button>
        ))}
      </div>

      {state !== 'unanswered' && word && (
        <div className="rounded-xl border border-border bg-white p-4 animate-slide-up">
          <div className="flex items-baseline gap-3">
            <span className="font-hanzi text-2xl text-hanzi">{word.hanzi}</span>
            {showPinyin && <span className="text-sm text-pinyin">{word.pinyin}</span>}
          </div>
          <p className="mt-1 text-sm text-gray-800">
            {(question.lang === 'vi'
              ? (word.meaningsVi.length > 0 ? word.meaningsVi : word.meaningsEn)
              : (word.meaningsEn.length > 0 ? word.meaningsEn : word.meaningsVi)
            ).join(question.lang === 'vi' ? '；' : ', ')}
          </p>
          {showSecondaryLanguage && (
            <p className="mt-0.5 text-xs text-gray-600">
              {(question.lang === 'vi' ? word.meaningsEn : word.meaningsVi).join(question.lang === 'vi' ? ', ' : '；')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
