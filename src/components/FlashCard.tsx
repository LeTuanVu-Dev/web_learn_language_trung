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
  const { showPinyin, showSecondaryLanguage } = useSettings()

  function flip() {
    setFlipped((value) => !value)
  }

  function handleNext(known: boolean) {
    setExiting(true)
    setTimeout(() => {
      setFlipped(false)
      setExiting(false)
      onNext?.(known)
    }, 200)
  }

  return (
    <div className="flex flex-col items-center select-none">
      <button
        onClick={flip}
        className={`w-full max-w-sm min-h-[300px] rounded-2xl border border-border bg-surface-2 flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
          exiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        aria-label={flipped ? 'Flip back' : 'Flip card'}
      >
        {!flipped ? (
          <div className="flex flex-col items-center gap-3 animate-slide-up">
            <p className="font-hanzi text-7xl text-hanzi leading-none">{word.hanzi}</p>
            {showPinyin && <p className="font-ui text-lg text-pinyin">{word.pinyin}</p>}
            <p className="text-xs text-gray-500 mt-4">Nhấn để lật thẻ</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full animate-flip-in">
            <p className="font-hanzi text-4xl text-hanzi">{word.hanzi}</p>
            <div className="w-full border-t border-border my-1" />
            <LangDisplay word={word} showPrimary showSecondary={showSecondaryLanguage} showPinyin={false} />

            {word.examples.length > 0 && (
              <div className="w-full mt-2 text-left">
                <p className="text-xs text-gray-500 mb-1">Ví dụ</p>
                <p className="font-hanzi text-base text-gray-900">{word.examples[0].zh}</p>
                {showPinyin && word.examples[0].pinyin && (
                  <p className="text-xs text-pinyin">{word.examples[0].pinyin}</p>
                )}
                <p className="text-sm text-gray-700 mt-0.5">
                  {word.examples[0].vi ?? word.examples[0].en ?? ''}
                </p>
              </div>
            )}

            {word.radicals.length > 0 && (
              <p className="text-xs text-gray-500">
                Bộ thủ: {word.radicals.join(' · ')}
                {word.strokeCount ? ` · ${word.strokeCount} nét` : ''}
              </p>
            )}
          </div>
        )}
      </button>

      {flipped && onNext && (
        <div className="flex gap-3 mt-4 w-full max-w-sm animate-slide-up">
          {showWriteLink && (
            <a
              href={`#/write?word=${word.id}`}
              className="flex-1 py-3 rounded-xl text-center text-sm font-medium border border-border text-gray-400 hover:border-pinyin hover:text-pinyin transition-colors"
            >
              Luyện viết
            </a>
          )}
          <button
            onClick={() => handleNext(false)}
            className="flex-1 py-3 rounded-xl text-sm font-medium bg-red-900/30 text-red-400 border border-red-900/50 hover:bg-red-900/50 transition-colors"
          >
            Chưa nhớ
          </button>
          <button
            onClick={() => handleNext(true)}
            className="flex-1 py-3 rounded-xl text-sm font-medium bg-green-900/30 text-green-400 border border-green-900/50 hover:bg-green-900/50 transition-colors"
          >
            Đã nhớ
          </button>
        </div>
      )}

      {!flipped && (
        <p className="mt-3 text-xs text-gray-500">
          {word.hskLevel ? `HSK ${word.hskLevel}` : ''} · {word.topics[0] ?? ''}
        </p>
      )}
    </div>
  )
}
