import { PointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { hanziCharacterData } from '../generated/hanzi-data'
import { WritingScoreResult } from '../types'
import { Point, scoreWritingSimilarity } from '../utils/writing-score'

interface Props {
  char: string
  onComplete?: (result: WritingScoreResult) => void
  checkMode?: 'strict' | 'shape' | 'auto'
  concealCharacter?: boolean
}

type Stroke = Point[]
type Phase = 'idle' | 'drawing' | 'done'

interface HanziCharData {
  medians?: number[][][]
}

function drawStrokes(
  canvas: HTMLCanvasElement,
  strokes: Stroke[],
  activeStroke: Stroke,
) {
  const context = canvas.getContext('2d')
  if (!context) return

  const ratio = window.devicePixelRatio || 1
  const width = canvas.clientWidth * ratio
  const height = canvas.clientHeight * ratio
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }

  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = '#2563eb'
  context.lineWidth = 5

  for (const stroke of [...strokes, activeStroke].filter((entry) => entry.length > 0)) {
    context.beginPath()
    context.moveTo(stroke[0].x, stroke[0].y)
    for (let index = 1; index < stroke.length; index += 1) {
      context.lineTo(stroke[index].x, stroke[index].y)
    }
    context.stroke()
  }
}

function toReferenceStrokes(charData: HanziCharData | undefined): Stroke[] {
  if (!charData?.medians) return []
  return charData.medians.map((stroke) =>
    stroke.map(([x, y]) => ({ x, y })),
  )
}

export function WritingCanvas({
  char,
  onComplete,
  checkMode = 'auto',
  concealCharacter = false,
}: Props) {
  const referenceRef = useRef<HTMLDivElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const writerRef = useRef<any>(null)
  const [loadError, setLoadError] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [activeStroke, setActiveStroke] = useState<Stroke>([])
  const [result, setResult] = useState<WritingScoreResult | null>(null)
  const [pointerId, setPointerId] = useState<number | null>(null)

  const charData = useMemo(() => hanziCharacterData[char] as HanziCharData | undefined, [char])
  const referenceStrokes = useMemo(() => toReferenceStrokes(charData), [charData])

  useEffect(() => {
    let cancelled = false
    setPhase('idle')
    setStrokes([])
    setActiveStroke([])
    setResult(null)
    setLoadError(!charData)

    async function initReference() {
      if (cancelled || !referenceRef.current) return
      referenceRef.current.innerHTML = ''

      const size = Math.min(referenceRef.current.offsetWidth, 320) || 280

      try {
        writerRef.current = HanziWriter.create(referenceRef.current, char, {
          width: size,
          height: size,
          padding: 12,
          showCharacter: !concealCharacter,
          showOutline: false,
          strokeColor: '#d97706',
          outlineColor: '#d7dde6',
          radicalColor: '#7c3aed',
          charDataLoader(targetChar, onLoad, onError) {
            const data = hanziCharacterData[targetChar]
            if (data) onLoad(data as any)
            else onError()
          },
          onLoadCharDataError() {
            if (!cancelled) setLoadError(true)
          },
        })

        if (concealCharacter) writerRef.current.hideCharacter?.()
      } catch {
        if (!cancelled) setLoadError(true)
      }
    }

    void initReference()
    return () => {
      cancelled = true
    }
  }, [char, concealCharacter, charData])

  useEffect(() => {
    if (drawCanvasRef.current) {
      drawStrokes(drawCanvasRef.current, strokes, activeStroke)
    }
  }, [strokes, activeStroke])

  function reset() {
    setStrokes([])
    setActiveStroke([])
    setResult(null)
    setPhase('idle')
    setPointerId(null)
    if (drawCanvasRef.current) drawStrokes(drawCanvasRef.current, [], [])
    if (concealCharacter) writerRef.current?.hideCharacter?.()
    else writerRef.current?.showCharacter?.()
  }

  function showReference() {
    if (!writerRef.current) return
    writerRef.current.hideCharacter?.()
    writerRef.current.animateCharacter({
      onComplete() {
        if (!concealCharacter) writerRef.current?.showCharacter?.()
      },
    })
  }

  function pushPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    setActiveStroke((current) => [...current, point])
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (pointerId !== null) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setPointerId(event.pointerId)
    setPhase('drawing')
    setResult(null)
    setActiveStroke([])
    pushPoint(event)
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (pointerId !== event.pointerId) return
    pushPoint(event)
  }

  function finishStroke(event: PointerEvent<HTMLCanvasElement>) {
    if (pointerId !== event.pointerId) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    setPointerId(null)
    setActiveStroke((current) => {
      if (current.length > 0) {
        setStrokes((prev) => [...prev, current])
      }
      return []
    })
  }

  function confirmResult() {
    const finalStrokes = activeStroke.length > 0 ? [...strokes, activeStroke] : strokes
    const score = scoreWritingSimilarity(referenceStrokes, finalStrokes)
    const finalResult: WritingScoreResult = {
      ...score,
      fallbackMode: checkMode === 'strict' ? 'strict' : 'shape',
    }

    setResult(finalResult)
    setPhase('done')
    onComplete?.(finalResult)
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface-2 p-6">
        <p className="font-hanzi text-7xl text-hanzi">{char}</p>
        <p className="text-center text-sm text-gray-600">
          Chua co du lieu cham tuong dong cho chu nay.
        </p>
      </div>
    )
  }

  const drawnPointCount = strokes.reduce((sum, stroke) => sum + stroke.length, 0) + activeStroke.length

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-[320px] overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div ref={referenceRef} className="aspect-square w-full opacity-80" />
        <canvas
          ref={drawCanvasRef}
          className="absolute inset-0 aspect-square w-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
        />
      </div>

      <div className="w-full max-w-xs rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-gray-700">
        {result ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-gray-900">Do tuong dong: {result.similarityPct}%</p>
              <p className="text-xs text-gray-600">
                {result.status === 'excellent'
                  ? 'Rat giong'
                  : result.status === 'good'
                    ? 'Kha giong'
                    : 'Can luyen them'}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              result.status === 'excellent'
                ? 'bg-green-100 text-green-700'
                : result.status === 'good'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {result.status === 'excellent' ? 'Excellent' : result.status === 'good' ? 'Good' : 'Practice'}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-700">
              {drawnPointCount > 0
                ? `Da ve ${strokes.length + (activeStroke.length > 0 ? 1 : 0)} net tu do. Bam cham bai de xem do giong.`
                : 'Viet tu do tren nen trang. He thong se cham theo hinh dang tong the.'}
            </p>
          </div>
        )}
      </div>

      <div className="flex w-full max-w-xs gap-2">
        <button
          onClick={showReference}
          className="flex-1 rounded-xl border border-border bg-white py-2.5 text-sm text-gray-800 transition-colors hover:border-pinyin hover:text-pinyin"
        >
          Xem net chuan
        </button>

        <button
          onClick={confirmResult}
          disabled={drawnPointCount === 0}
          className="flex-1 rounded-xl border border-pinyin/40 bg-pinyin/10 py-2.5 text-sm font-medium text-pinyin transition-colors hover:bg-pinyin/20 disabled:opacity-40"
        >
          Cham bai
        </button>

        <button
          onClick={reset}
          className="flex-1 rounded-xl border border-border bg-white py-2.5 text-sm text-gray-800 transition-colors hover:border-red-400 hover:text-red-600"
        >
          Viet lai
        </button>
      </div>

      {phase === 'done' && result?.fallbackMode && (
        <p className="text-xs text-gray-500">
          Dang cham theo do giong hinh dang, bo qua khac biet to nho va vi tri.
        </p>
      )}
    </div>
  )
}
