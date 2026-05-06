import { LessonSpec, WordEntry } from '../types'
import { getDeckWords } from '../store/decks'
import { getAllRadicals } from '../data'
import { getVocabularyWords } from '../store/vocabulary'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function buildLesson(spec: LessonSpec): WordEntry[] {
  const allWords = getVocabularyWords()
  let pool: WordEntry[]

  switch (spec.source) {
    case 'hsk':
      pool = allWords.filter((word) => word.hskLevel === (spec.filters.hskLevel ?? 1))
      break
    case 'topic':
      pool = allWords.filter((word) => word.topics.includes(spec.filters.topic ?? ''))
      break
    case 'radical':
      pool = allWords.filter((word) => word.radicals.includes(spec.filters.radical ?? ''))
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
    filters: { hskLevel: 1, radical: getAllRadicals()[0] ?? undefined },
    size: 20,
    modeMix: ['flashcard', 'quiz', 'write'],
    primaryLanguage: 'vi',
    showSecondaryLanguage: false,
  }
}
