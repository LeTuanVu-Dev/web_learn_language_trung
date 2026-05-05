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
      return 'border-border bg-surface-2 text-gray-200 hover:border-pinyin hover:text-white active:scale-[0.97]'
    }
    if (id === question.correctId) return 'border-green-600 bg-green-900/30 text-green-300'
    if (id === selected) return 'border-red-600 bg-red-900/30 text-red-300'
    return 'border-border bg-surface-2 text-gray-500 opacity-60'
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-5 animate-slide-up">
      <div className="rounded-2xl border border-border bg-surface-2 p-6 flex flex-col items-center gap-2 min-h-[120px] justify-center">
        {isHanziPrompt ? (
          <>
            <p className="font-hanzi text-6xl text-hanzi leading-none">{question.promptHanzi}</p>
            {showPinyin && question.promptPinyin && (
              <p className="text-base text-pinyin font-ui">{question.promptPinyin}</p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              {question.lang === 'vi' ? 'Chọn nghĩa đúng' : 'Choose the correct meaning'}
            </p>
          </>
        ) : (
          <>
            <p className="text-lg text-gray-200 font-ui text-center">{question.prompt}</p>
            <p className="text-xs text-gray-600 mt-1">
              {question.lang === 'vi' ? 'Chọn chữ Hán đúng' : 'Pick the matching hanzi'}
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => choose(choice.id)}
            className={`rounded-xl border p-3 text-center transition-all duration-150 cursor-pointer ${
              choice.hanzi ? 'font-hanzi text-3xl' : 'font-ui text-sm leading-tight'
            } ${choiceClass(choice.id)}`}
          >
            {choice.hanzi ?? choice.text}
            {state !== 'unanswered' && choice.id === question.correctId && !choice.hanzi && (
              <span className="block text-xs text-green-400 mt-0.5">✓</span>
            )}
          </button>
        ))}
      </div>

      {state !== 'unanswered' && word && (
        <div className="rounded-xl border border-border bg-surface-3 p-4 animate-slide-up">
          <div className="flex items-baseline gap-3">
            <span className="font-hanzi text-2xl text-hanzi">{word.hanzi}</span>
            {showPinyin && <span className="text-sm text-pinyin">{word.pinyin}</span>}
          </div>
          <p className="text-sm text-gray-300 mt-1">
            {(question.lang === 'vi'
              ? (word.meaningsVi.length > 0 ? word.meaningsVi : word.meaningsEn)
              : (word.meaningsEn.length > 0 ? word.meaningsEn : word.meaningsVi)
            ).join(question.lang === 'vi' ? '；' : ', ')}
          </p>
          {showSecondaryLanguage && (
            <p className="text-xs text-gray-500 mt-0.5">
              {(question.lang === 'vi' ? word.meaningsEn : word.meaningsVi).join(question.lang === 'vi' ? ', ' : '；')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
