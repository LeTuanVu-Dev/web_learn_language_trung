export type Lang = 'vi' | 'en'
export type LearningMode = 'zh-vi' | 'zh-en' | 'zh-bilingual'
export type WritingCheckMode = 'strict' | 'shape' | 'auto'

export interface ExampleEntry {
  zh: string
  pinyin?: string
  vi?: string
  en?: string
}

export interface WordEntry {
  id: string
  hanzi: string
  simplified: string
  traditional?: string
  pinyin: string
  meaningsVi: string[]
  meaningsEn: string[]
  examples: ExampleEntry[]
  hskLevel?: number
  topics: string[]
  radicals: string[]
  characterIds: string[]
  strokeCount?: number
}

export interface CharacterEntry {
  id: string
  char: string
  radical: string
  components: string[]
  strokeCount: number
  strokeAssetId?: string
  pronunciations: string[]
  meaningHintsVi: string[]
  meaningHintsEn: string[]
}

export interface DeckEntry {
  id: string
  name: string
  wordIds: string[]
  isCustom: boolean
  createdAt: number
}

export interface LessonSpec {
  source: 'all' | 'hsk' | 'topic' | 'radical' | 'deck' | 'mixed'
  filters: {
    hskLevel?: number
    topic?: string
    radical?: string
    deckId?: string
  }
  size: number
  modeMix: ('flashcard' | 'quiz' | 'write')[]
  primaryLanguage: Lang
  showSecondaryLanguage: boolean
}

export interface Settings {
  primaryLanguage: Lang
  showSecondaryLanguage: boolean
  showPinyin: boolean
  writingCheckMode: WritingCheckMode
  learningMode: LearningMode
}

export interface QuizQuestion {
  id: string
  type: 'meaning-from-hanzi' | 'hanzi-from-meaning' | 'match' | 'fill-blank' | 'radical-id' | 'topic-sort'
  wordId: string
  prompt: string
  promptHanzi?: string
  promptPinyin?: string
  choices: QuizChoice[]
  correctId: string
  lang: Lang
}

export interface QuizChoice {
  id: string
  text: string
  hanzi?: string
}

export interface SessionResult {
  wordId: string
  correct: boolean
  attempts: number
  timeMs: number
}

export type DataPackId = 'hsk1' | 'hsk2' | 'hsk3' | 'radicals'

export interface DataPackMeta {
  id: DataPackId
  label: string
  count: number
  loaded: boolean
}
