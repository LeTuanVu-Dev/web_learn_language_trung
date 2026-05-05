import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { hanziCharacterData } from '../generated/hanzi-data'

interface Props {
  char: string
  onComplete?: (mistakes: number) => void
  checkMode?: 'strict' | 'shape' | 'auto'
  concealCharacter?: boolean
}

type Phase = 'idle' | 'animating' | 'quiz' | 'await-confirm' | 'done'

export function WritingCanvas({
  char,
  onComplete,
  checkMode = 'auto',
  concealCharacter = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<any>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [mistakes, setMistakes] = useState(0)
  const [strokesDone, setStrokesDone] = useState(0)
  const [totalStrokes, setTotalStrokes] = useState(0)
  const [loadError, setLoadError] = useState(false)
  const [pendingMistakes, setPendingMistakes] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setPhase('idle')
    setMistakes(0)
    setStrokesDone(0)
    setTotalStrokes(0)
    setPendingMistakes(null)
    setLoadError(false)

    async function init() {
      if (cancelled || !containerRef.current) return

      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz?.()
        } catch {}
        containerRef.current.innerHTML = ''
      }

      const size = Math.min(containerRef.current.offsetWidth, 320) || 280

      try {
        const writer = HanziWriter.create(containerRef.current, char, {
          width: size,
          height: size,
          padding: 12,
          showCharacter: !concealCharacter,
          showOutline: !concealCharacter,
          strokeColor: '#d97706',
          outlineColor: '#d7dde6',
          drawingColor: '#2563eb',
          drawingWidth: 4,
          radicalColor: '#7c3aed',
          charDataLoader(targetChar, onLoad, onError) {
            const charData = hanziCharacterData[targetChar]
            if (charData) {
              onLoad(charData as any)
              return
            }
            onError()
          },
          onLoadCharDataError() {
            if (!cancelled) setLoadError(true)
          },
        })
        writerRef.current = writer
      } catch {
        setLoadError(true)
      }
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [char, concealCharacter])

  function showReference() {
    if (!writerRef.current) return
    writerRef.current.cancelQuiz?.()
    writerRef.current.hideCharacter?.()
    writerRef.current.animateCharacter({
      onComplete() {
        setPhase('idle')
      },
    })
    setPhase('animating')
  }

  function startQuiz() {
    if (!writerRef.current) return
    setPhase('quiz')
    setMistakes(0)
    setStrokesDone(0)
    setTotalStrokes(0)
    setPendingMistakes(null)
    if (concealCharacter) {
      writerRef.current.hideCharacter?.()
    }

    writerRef.current.quiz({
      leniency: checkMode === 'shape' ? 0.95 : checkMode === 'strict' ? 0.22 : 0.38,
      showHintAfterMisses: checkMode === 'shape' ? 2 : checkMode === 'strict' ? 5 : 3,
      onMistake() {
        setMistakes((value) => value + 1)
      },
      onCorrectStroke(data: { strokeNum: number; totalStrokeCount: number }) {
        setStrokesDone(data.strokeNum + 1)
        setTotalStrokes(data.totalStrokeCount)
      },
      onComplete(summary: { mistakes: number }) {
        setPendingMistakes(summary.mistakes)
        setPhase('await-confirm')
      },
    })
  }

  function confirmResult() {
    const finalMistakes = pendingMistakes ?? mistakes
    setPhase('done')
    onComplete?.(finalMistakes)
  }

  function reset() {
    if (!writerRef.current) return
    writerRef.current.cancelQuiz?.()
    if (concealCharacter) {
      writerRef.current.hideCharacter?.()
    } else {
      writerRef.current.showCharacter?.()
    }
    setPhase('idle')
    setMistakes(0)
    setStrokesDone(0)
    setTotalStrokes(0)
    setPendingMistakes(null)
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-surface-2">
        <p className="font-hanzi text-7xl text-hanzi">{char}</p>
        <p className="text-sm text-gray-500 text-center">
          Chưa có dữ liệu nét cho chữ này.
          <br />
          <span className="text-xs">Chữ này chưa có template để chấm nét trong bộ dữ liệu hiện tại.</span>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="rounded-2xl border border-border bg-white overflow-hidden w-full max-w-[320px] aspect-square shadow-sm"
      />

      {phase === 'quiz' && totalStrokes > 0 && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Nét {strokesDone}/{totalStrokes}</span>
            <span className={mistakes > 0 ? 'text-red-600' : 'text-green-600'}>
              {mistakes > 0 ? `${mistakes} lỗi` : 'Đang tốt'}
            </span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-pinyin rounded-full transition-all"
              style={{ width: `${(strokesDone / totalStrokes) * 100}%` }}
            />
          </div>
        </div>
      )}

      {phase === 'await-confirm' && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-center animate-slide-up w-full max-w-xs">
          <p className="text-amber-700 font-medium">Đã ghi xong</p>
          <p className="text-xs text-amber-600 mt-1">Bấm xác nhận để chấm và lật đáp án.</p>
        </div>
      )}

      {phase === 'done' && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-center animate-slide-up">
          <p className="text-green-700 font-medium">Đã chấm xong</p>
          <p className="text-xs text-green-600">
            {mistakes === 0 ? 'Đúng chuẩn' : `${mistakes} lỗi cần sửa`}
          </p>
        </div>
      )}

      <div className="flex gap-2 w-full max-w-xs">
        <button
          onClick={showReference}
          disabled={phase === 'quiz'}
          className="flex-1 py-2.5 rounded-xl text-sm border border-border text-gray-700 hover:border-pinyin hover:text-pinyin disabled:opacity-40 transition-colors bg-white"
        >
          Xem nét chuẩn
        </button>

        {phase === 'idle' ? (
          <button
            onClick={startQuiz}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-pinyin/10 border border-pinyin/50 text-pinyin hover:bg-pinyin/20 transition-colors"
          >
            Bắt đầu viết
          </button>
        ) : phase === 'await-confirm' ? (
          <button
            onClick={confirmResult}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-hanzi/10 border border-hanzi/50 text-hanzi hover:bg-hanzi/20 transition-colors"
          >
            Confirm
          </button>
        ) : (
          <button
            onClick={reset}
            className="flex-1 py-2.5 rounded-xl text-sm border border-border text-gray-700 hover:border-red-400 hover:text-red-500 transition-colors bg-white"
          >
            Viết lại
          </button>
        )}
      </div>
    </div>
  )
}
