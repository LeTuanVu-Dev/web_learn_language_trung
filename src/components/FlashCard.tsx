import { useState } from 'react'
import { WordEntry } from '../types'
import { LangDisplay } from './LangDisplay'
import { useSettings } from '../store/settings'

interface Props {
  word: WordEntry
  onNext?: (known: boolean) => void
  showWriteLink?: boolean
}

export function FlashCard({ word, onNext, showWriteLink = false }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [showHintPinyin, setShowHintPinyin] = useState(false)
  const { showPinyin, showSecondaryLanguage, primaryLanguage } = useSettings()
  const isVi = primaryLanguage === 'vi'

  function flip() {
    setFlipped((value) => !value)
    if (flipped) setShowHintPinyin(false)
  }

  function handleNext(known: boolean) {
    setExiting(true)
    setTimeout(() => {
      setFlipped(false)
      setExiting(false)
      setShowHintPinyin(false)
      onNext?.(known)
    }, 200)
  }

  return (
    <div className="flex select-none flex-col items-center">
      <button
        onClick={flip}
        className={`flex min-h-[300px] w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-border bg-surface-2 p-8 transition-all duration-200 active:scale-[0.98] ${
          exiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label={flipped ? 'Flip back' : 'Flip card'}
      >
        {!flipped ? (
          <div className="flex animate-slide-up flex-col items-center gap-3">
            <p className="font-hanzi text-7xl leading-none text-hanzi">{word.hanzi}</p>
            <p className="mt-4 text-xs text-gray-600">{isVi ? 'Nhấn để lật thẻ' : 'Tap to flip'}</p>
            {showPinyin && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setShowHintPinyin((value) => !value)
                }}
                className="rounded-full border border-pinyin/30 px-3 py-1 text-xs text-pinyin hover:bg-pinyin/10"
              >
                {showHintPinyin ? word.pinyin : (isVi ? 'Gợi ý pinyin' : 'Pinyin hint')}
              </button>
            )}
          </div>
        ) : (
          <div className="flex w-full animate-flip-in flex-col items-center gap-4">
            <p className="font-hanzi text-4xl text-hanzi">{word.hanzi}</p>
            <div className="my-1 w-full border-t border-border" />
            <LangDisplay word={word} showPrimary showSecondary={showSecondaryLanguage} showPinyin={showHintPinyin && showPinyin} />

            {word.examples.length > 0 && (
              <div className="mt-2 w-full text-left">
                <p className="mb-1 text-xs text-gray-600">{isVi ? 'Ví dụ' : 'Example'}</p>
                <p className="font-hanzi text-base text-gray-900">{word.examples[0].zh}</p>
                {showHintPinyin && showPinyin && word.examples[0].pinyin && (
                  <p className="text-xs text-pinyin">{word.examples[0].pinyin}</p>
                )}
                <p className="mt-0.5 text-sm text-gray-800">
                  {isVi
                    ? (word.examples[0].vi ?? word.examples[0].en ?? '')
                    : (word.examples[0].en ?? word.examples[0].vi ?? '')}
                </p>
              </div>
            )}

            {showPinyin && !showHintPinyin && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setShowHintPinyin(true)
                }}
                className="rounded-full border border-pinyin/30 px-3 py-1 text-xs text-pinyin hover:bg-pinyin/10"
              >
                {isVi ? 'Hiện pinyin' : 'Show pinyin'}
              </button>
            )}

            {word.radicals.length > 0 && (
              <p className="text-xs text-gray-700">
                {isVi ? 'Bộ thủ' : 'Radicals'}: {word.radicals.join(' · ')}
                {word.strokeCount ? ` · ${word.strokeCount} ${isVi ? 'nét' : 'strokes'}` : ''}
              </p>
            )}
          </div>
        )}
      </button>

      {flipped && onNext && (
        <div className="mt-4 flex w-full max-w-sm gap-3 animate-slide-up">
          {showWriteLink && (
            <a
              href={`#/write?word=${word.id}`}
              className="flex-1 rounded-xl border border-border py-3 text-center text-sm font-medium text-gray-800 transition-colors hover:border-pinyin hover:text-pinyin"
            >
              {isVi ? 'Luyện viết' : 'Write'}
            </a>
          )}
          <button
            onClick={() => handleNext(false)}
            className="flex-1 rounded-xl border border-red-300 bg-red-50 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            {isVi ? 'Chưa nhớ' : 'Review'}
          </button>
          <button
            onClick={() => handleNext(true)}
            className="flex-1 rounded-xl border border-green-300 bg-green-50 py-3 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
          >
            {isVi ? 'Đã nhớ' : 'Known'}
          </button>
        </div>
      )}

      {!flipped && (
        <p className="mt-3 text-xs text-gray-600">
          {word.hskLevel ? `HSK ${word.hskLevel}` : ''} · {word.topics[0] ?? (isVi ? 'Không gắn chủ đề' : 'No topic')}
        </p>
      )}
    </div>
  )
}
