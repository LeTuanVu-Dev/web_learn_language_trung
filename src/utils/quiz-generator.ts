import { WordEntry, QuizQuestion, QuizChoice, Lang } from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getMeaning(word: WordEntry, lang: Lang): string {
  const meanings = lang === 'vi' ? word.meaningsVi : word.meaningsEn
  return meanings[0] ?? ''
}

function pickDistractors(target: WordEntry, pool: WordEntry[], count: number): WordEntry[] {
  const candidates = pool.filter(w => w.id !== target.id)
  const sameTopic = candidates.filter(w => w.topics.some(t => target.topics.includes(t)))
  const rest = candidates.filter(w => !w.topics.some(t => target.topics.includes(t)))
  const ordered = [...shuffle(sameTopic), ...shuffle(rest)]
  return ordered.slice(0, count)
}

export function generateMeaningFromHanziQ(
  word: WordEntry,
  pool: WordEntry[],
  lang: Lang
): QuizQuestion | null {
  const meaning = getMeaning(word, lang)
  if (!meaning) return null

  const distractors = pickDistractors(word, pool, 3)
  const choices: QuizChoice[] = shuffle([
    { id: word.id, text: meaning },
    ...distractors.map(d => ({ id: d.id, text: getMeaning(d, lang) })).filter(c => c.text),
  ]).slice(0, 4)

  if (choices.length < 2) return null

  return {
    id: `q_${word.id}_mfh`,
    type: 'meaning-from-hanzi',
    wordId: word.id,
    prompt: word.hanzi,
    promptHanzi: word.hanzi,
    promptPinyin: word.pinyin,
    choices,
    correctId: word.id,
    lang,
  }
}

export function generateHanziFromMeaningQ(
  word: WordEntry,
  pool: WordEntry[],
  lang: Lang
): QuizQuestion | null {
  const meaning = getMeaning(word, lang)
  if (!meaning) return null

  const distractors = pickDistractors(word, pool, 3)
  const choices: QuizChoice[] = shuffle([
    { id: word.id, text: word.hanzi, hanzi: word.hanzi },
    ...distractors.map(d => ({ id: d.id, text: d.hanzi, hanzi: d.hanzi })),
  ]).slice(0, 4)

  return {
    id: `q_${word.id}_hfm`,
    type: 'hanzi-from-meaning',
    wordId: word.id,
    prompt: meaning,
    choices,
    correctId: word.id,
    lang,
  }
}

export function generateQuiz(
  words: WordEntry[],
  pool: WordEntry[],
  lang: Lang,
  count: number
): QuizQuestion[] {
  const eligibleWords = lang === 'en' ? words.filter(w => w.meaningsEn.length > 0) : words
  const shuffled = shuffle(eligibleWords).slice(0, count)
  const questions: QuizQuestion[] = []

  for (const word of shuffled) {
    const type = Math.random() < 0.5 ? 'mfh' : 'hfm'
    const q =
      type === 'mfh'
        ? generateMeaningFromHanziQ(word, pool, lang)
        : generateHanziFromMeaningQ(word, pool, lang)
    if (q) questions.push(q)
  }

  return questions
}
