import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { FlashCard } from '../components/FlashCard'
import { QuizCard } from '../components/QuizCard'
import { WritingCanvas } from '../components/WritingCanvas'
import { LangDisplay } from '../components/LangDisplay'
import { buildLesson } from '../utils/lesson-builder'
import { generateQuiz } from '../utils/quiz-generator'
import { LessonSpec, QuizQuestion, WordEntry, WritingScoreResult } from '../types'
import { getAllRadicals } from '../data'
import { useSettings } from '../store/settings'
import { useDecks } from '../store/decks'
import { useVocabularyStore } from '../store/vocabulary'

type Step =
  | { type: 'flashcard'; word: WordEntry }
  | { type: 'quiz'; question: QuizQuestion }
  | { type: 'write'; word: WordEntry; char: string }

function shuffle<T>(items: T[]) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildSteps(words: WordEntry[], lang: 'vi' | 'en', mix: LessonSpec['modeMix']): Step[] {
  const steps: Step[] = []

  if (mix.includes('flashcard')) {
    for (const word of words) steps.push({ type: 'flashcard', word })
  }

  if (mix.includes('quiz')) {
    const quizWords = words.slice(0, Math.max(3, Math.ceil(words.length * 0.7)))
    const questions = generateQuiz(quizWords, words, lang, quizWords.length)
    for (const question of questions) steps.push({ type: 'quiz', question })
  }

  if (mix.includes('write')) {
    for (const word of words.slice(0, Math.max(2, Math.ceil(words.length * 0.5)))) {
      const char = Array.from(word.simplified)[0]
      if (char) steps.push({ type: 'write', word, char })
    }
  }

  return shuffle(steps)
}

export function Lesson() {
  const settings = useSettings()
  const isVi = settings.primaryLanguage === 'vi'
  const { decks } = useDecks()
  const allWords = useVocabularyStore((state) => state.words)
  const officialTopics = useVocabularyStore((state) => state.officialTopics)
  const syncStatus = useVocabularyStore((state) => state.syncStatus)
  const radicals = useMemo(() => getAllRadicals(), [])
  const hskLevels = useMemo(() => {
    const levels = new Set<number>()
    allWords.forEach((word) => {
      if (word.hskLevel) levels.add(word.hskLevel)
    })
    return Array.from(levels).sort((a, b) => a - b)
  }, [allWords])

  const [spec, setSpec] = useState<LessonSpec>({
    source: 'hsk',
    filters: { hskLevel: hskLevels[0] ?? 1 },
    size: 8,
    modeMix: ['flashcard', 'quiz', 'write'],
    primaryLanguage: settings.primaryLanguage,
    showSecondaryLanguage: settings.showSecondaryLanguage,
  })
  const [seed, setSeed] = useState(0)

  const mergedSpec = useMemo(() => ({
    ...spec,
    primaryLanguage: settings.primaryLanguage,
    showSecondaryLanguage: settings.showSecondaryLanguage,
  }), [spec, settings.primaryLanguage, settings.showSecondaryLanguage])

  const words = useMemo(() => buildLesson(mergedSpec), [mergedSpec, seed, allWords])
  const steps = useMemo(
    () => buildSteps(words, settings.primaryLanguage, mergedSpec.modeMix),
    [words, settings.primaryLanguage, mergedSpec.modeMix, seed],
  )
  const wordMap = useMemo(() => new Map(allWords.map((word) => [word.id, word])), [allWords])

  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  function advance(wasCorrect?: boolean) {
    if (wasCorrect) setCorrect((value) => value + 1)
    const next = index + 1
    if (next >= steps.length) setDone(true)
    else setIndex(next)
  }

  function regenerate() {
    setSeed((value) => value + 1)
    setIndex(0)
    setCorrect(0)
    setDone(false)
  }

  function toggleMode(mode: LessonSpec['modeMix'][number]) {
    setSpec((current) => {
      const exists = current.modeMix.includes(mode)
      const nextMix = exists
        ? current.modeMix.filter((item) => item !== mode)
        : [...current.modeMix, mode]

      return {
        ...current,
        modeMix: nextMix.length > 0 ? nextMix : [mode],
      }
    })
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="font-hanzi text-5xl text-hanzi">完成</div>
        <p className="text-gray-700">
          {isVi ? 'Bài học hoàn tất' : 'Lesson complete'} · {correct}/{steps.length} {isVi ? 'bước đúng' : 'correct steps'}
        </p>
        <button
          onClick={regenerate}
          className="rounded-xl border border-pinyin/50 bg-pinyin/10 px-6 py-3 text-pinyin transition-colors hover:bg-pinyin/20"
        >
          {isVi ? 'Tạo lesson mới' : 'Create new lesson'}
        </button>
      </div>
    )
  }

  if (!steps.length) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <LessonControls
          spec={spec}
          setSpec={setSpec}
          hskLevels={hskLevels}
          topics={officialTopics}
          radicals={radicals}
          decks={decks.filter((deck) => deck.isCustom)}
          onRegenerate={regenerate}
          toggleMode={toggleMode}
          syncStatus={syncStatus}
        />
        <div className="rounded-2xl border border-border bg-surface-2 p-4 text-sm text-gray-700">
          {isVi ? 'Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.' : 'No data matches the current filters.'}
        </div>
      </div>
    )
  }

  const step = steps[index]
  const progress = (index / steps.length) * 100

  return (
    <div className="flex flex-col gap-4 py-4">
      <LessonControls
        spec={spec}
        setSpec={setSpec}
        hskLevels={hskLevels}
        topics={officialTopics}
        radicals={radicals}
        decks={decks.filter((deck) => deck.isCustom)}
        onRegenerate={regenerate}
        toggleMode={toggleMode}
        syncStatus={syncStatus}
      />

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{isVi ? 'Bài học' : 'Lesson'} · {index + 1}/{steps.length}</span>
        <span className={step.type === 'flashcard' ? 'text-hanzi' : step.type === 'quiz' ? 'text-pinyin' : 'text-vi'}>
          {step.type === 'flashcard' ? 'Flashcard' : step.type === 'quiz' ? 'Quiz' : 'Writing'}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-hanzi to-pinyin transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {step.type === 'flashcard' && (
        <FlashCard key={step.word.id} word={step.word} onNext={() => advance()} showWriteLink />
      )}
      {step.type === 'quiz' && (
        <QuizCard key={step.question.id} question={step.question} wordMap={wordMap} onAnswer={(correctAnswer) => advance(correctAnswer)} />
      )}
      {step.type === 'write' && (
        <LessonWriteStep word={step.word} char={step.char} onDone={() => advance(true)} />
      )}
    </div>
  )
}

function LessonWriteStep({
  word,
  char,
  onDone,
}: {
  word: WordEntry
  char: string
  onDone: () => void
}) {
  const [revealed, setRevealed] = useState(false)
  const [result, setResult] = useState<WritingScoreResult | null>(null)
  const { primaryLanguage } = useSettings()
  const isVi = primaryLanguage === 'vi'

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-surface-2 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-hanzi text-5xl text-hanzi">{char}</p>
            <p className="mt-1 text-xs text-gray-600">
              {isVi ? 'Viết xong rồi chấm theo độ giống hình dạng.' : 'Write it, then score by shape similarity.'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">{isVi ? 'Từ gốc' : 'Source word'}</p>
            <p className="font-hanzi text-2xl text-gray-900">{word.hanzi}</p>
          </div>
        </div>
      </div>

      <WritingCanvas
        char={char}
        onComplete={(value) => {
          setResult(value)
          setRevealed(true)
        }}
      />

      {revealed && result && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-900">{isVi ? 'Đáp án của từ' : 'Word answer'}</p>
            <p className={`text-xs ${
              result.status === 'excellent'
                ? 'text-green-600'
                : result.status === 'good'
                  ? 'text-amber-600'
                  : 'text-red-600'
            }`}>
              {result.similarityPct}% {isVi ? 'tương đồng' : 'similar'}
            </p>
          </div>
          <div>
            <p className="font-hanzi text-4xl text-hanzi">{word.hanzi}</p>
            <LangDisplay word={word} showPrimary showSecondary showPinyin />
          </div>
          <button
            onClick={onDone}
            className="w-full rounded-xl border border-pinyin/50 bg-pinyin/10 py-3 text-sm font-medium text-pinyin transition-colors hover:bg-pinyin/20"
          >
            {isVi ? 'Bước tiếp theo' : 'Next step'}
          </button>
        </div>
      )}
    </div>
  )
}

function LessonControls({
  spec,
  setSpec,
  hskLevels,
  topics,
  radicals,
  decks,
  onRegenerate,
  toggleMode,
  syncStatus,
}: {
  spec: LessonSpec
  setSpec: Dispatch<SetStateAction<LessonSpec>>
  hskLevels: number[]
  topics: { id: string; name: string }[]
  radicals: string[]
  decks: { id: string; name: string }[]
  onRegenerate: () => void
  toggleMode: (mode: LessonSpec['modeMix'][number]) => void
  syncStatus: string
}) {
  const { primaryLanguage } = useSettings()
  const isVi = primaryLanguage === 'vi'

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-2 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{isVi ? 'Lesson ngẫu nhiên' : 'Random lesson'}</h1>
          <p className="mt-1 text-xs text-gray-600">
            {isVi ? 'Chọn nguồn học rồi tạo phiên luyện mới.' : 'Choose a source, then generate a new practice session.'}
          </p>
        </div>
        <button
          onClick={onRegenerate}
          className="rounded-xl border border-pinyin/40 px-3 py-2 text-xs text-pinyin transition-colors hover:bg-pinyin/10"
        >
          {isVi ? 'Random lại' : 'Shuffle'}
        </button>
      </div>

      <p className={`text-xs ${syncStatus === 'loading' ? 'text-pinyin' : 'text-gray-600'}`}>
        {syncStatus === 'loading'
          ? (isVi ? 'Đang đồng bộ chủ đề...' : 'Syncing topics...')
          : (isVi ? 'Đang dùng cache chủ đề dự phòng.' : 'Using fallback topic cache.')}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          {isVi ? 'Nguồn học' : 'Source'}
          <select
            value={spec.source}
            onChange={(event) => setSpec((current) => ({
              ...current,
              source: event.target.value as LessonSpec['source'],
            }))}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-pinyin"
          >
            <option value="all">{isVi ? 'Toàn thư viện' : 'Full library'}</option>
            <option value="hsk">{isVi ? 'Theo HSK' : 'By HSK'}</option>
            <option value="topic">{isVi ? 'Theo chủ đề' : 'By topic'}</option>
            <option value="radical">{isVi ? 'Theo bộ thủ' : 'By radical'}</option>
            <option value="deck">{isVi ? 'Theo bộ thẻ' : 'By deck'}</option>
            <option value="mixed">{isVi ? 'Trộn ngẫu nhiên' : 'Mixed random'}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-600">
          {isVi ? 'Số mục' : 'Item count'}
          <select
            value={spec.size}
            onChange={(event) => setSpec((current) => ({
              ...current,
              size: Number(event.target.value),
            }))}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-pinyin"
          >
            {[5, 8, 10, 12, 15].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>

      {spec.source === 'hsk' && (
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          {isVi ? 'Cấp HSK' : 'HSK level'}
          <select
            value={spec.filters.hskLevel ?? hskLevels[0] ?? 1}
            onChange={(event) => setSpec((current) => ({
              ...current,
              filters: {
                ...current.filters,
                hskLevel: Number(event.target.value),
              },
            }))}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-pinyin"
          >
            {hskLevels.map((level) => (
              <option key={level} value={level}>HSK {level}</option>
            ))}
          </select>
        </label>
      )}

      {spec.source === 'topic' && (
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          {isVi ? 'Chủ đề' : 'Topic'}
          <select
            value={spec.filters.topic ?? topics[0]?.name ?? ''}
            onChange={(event) => setSpec((current) => ({
              ...current,
              filters: {
                ...current.filters,
                topic: event.target.value,
              },
            }))}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-pinyin"
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.name}>{topic.name}</option>
            ))}
          </select>
        </label>
      )}

      {spec.source === 'radical' && (
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          {isVi ? 'Bộ thủ' : 'Radical'}
          <select
            value={spec.filters.radical ?? radicals[0] ?? ''}
            onChange={(event) => setSpec((current) => ({
              ...current,
              filters: {
                ...current.filters,
                radical: event.target.value,
              },
            }))}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-pinyin"
          >
            {radicals.map((radical) => (
              <option key={radical} value={radical}>{radical}</option>
            ))}
          </select>
        </label>
      )}

      {spec.source === 'deck' && (
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          {isVi ? 'Bộ thẻ' : 'Deck'}
          <select
            value={spec.filters.deckId ?? decks[0]?.id ?? ''}
            onChange={(event) => setSpec((current) => ({
              ...current,
              filters: {
                ...current.filters,
                deckId: event.target.value,
              },
            }))}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-pinyin"
          >
            {decks.length === 0 && <option value="">{isVi ? 'Chưa có bộ thẻ riêng' : 'No custom decks yet'}</option>}
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>{deck.name}</option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-wrap gap-2">
        {([
          ['flashcard', 'Flashcard'],
          ['quiz', 'Quiz'],
          ['write', isVi ? 'Luyện viết' : 'Writing'],
        ] as const).map(([value, label]) => {
          const active = spec.modeMix.includes(value)
          return (
            <button
              key={value}
              onClick={() => toggleMode(value)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                active
                  ? 'border-pinyin bg-pinyin/10 text-pinyin'
                  : 'border-border text-gray-700 hover:border-pinyin hover:text-pinyin'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
