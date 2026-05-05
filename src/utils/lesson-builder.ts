import { LessonSpec, WordEntry } from '../types'
import { allWords, getWordsByHsk, getWordsByTopic, getWordsByRadical } from '../data'
import { getDeckWords } from '../store/decks'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function buildLesson(spec: LessonSpec): WordEntry[] {
  let pool: WordEntry[]

  switch (spec.source) {
    case 'hsk':
      pool = getWordsByHsk(spec.filters.hskLevel ?? 1)
      break
    case 'topic':
      pool = getWordsByTopic(spec.filters.topic ?? '')
      break
    case 'radical':
      pool = getWordsByRadical(spec.filters.radical ?? '')
      break
    case 'deck':
      pool = getDeckWords(spec.filters.deckId ?? '', allWords)
      break
    case 'mixed':
      pool = allWords
      break
    default:
      pool = allWords
  }

  if (spec.primaryLanguage === 'en') {
    pool = pool.filter((word) => word.meaningsEn.length > 0)
  }

  return shuffle(pool).slice(0, spec.size)
}

export function defaultLessonSpec(): LessonSpec {
  return {
    source: 'hsk',
    filters: { hskLevel: 1 },
    size: 20,
    modeMix: ['flashcard', 'quiz', 'write'],
    primaryLanguage: 'vi',
    showSecondaryLanguage: false,
  }
}
