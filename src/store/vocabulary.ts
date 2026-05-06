import { create } from 'zustand'
import { allWords as builtinWords } from '../data'
import { syncHanziiTopicCatalog } from '../services/hanzii-runtime'
import { ImportedWordEntry, TopicEntry, VocabularySource, WordEntry } from '../types'

const IMPORT_STORAGE_KEY = 'hanzixue_imported_words'
const TOPIC_CACHE_STORAGE_KEY = 'hanzixue_topic_cache'
const TOPIC_SYNC_MESSAGE_KEY = 'hanzixue_topic_sync_message'

type SyncStatus = 'idle' | 'loading' | 'runtime' | 'local-fallback' | 'error'

interface VocabularyStore {
  words: WordEntry[]
  officialTopics: TopicEntry[]
  syncStatus: SyncStatus
  syncMessage: string
  initialized: boolean
  init: () => Promise<void>
  upsertImportedWords: (words: ImportedWordEntry[], sourceLabel: string) => {
    createdWords: number
    updatedWords: number
    wordIds: string[]
  }
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function mergeWordEntries(base: WordEntry, incoming: ImportedWordEntry): ImportedWordEntry {
  return {
    ...base,
    ...incoming,
    id: base.id,
    traditional: incoming.traditional ?? base.traditional,
    meaningsVi: uniqueStrings([...base.meaningsVi, ...incoming.meaningsVi]),
    meaningsEn: uniqueStrings([...base.meaningsEn, ...incoming.meaningsEn]),
    examples: incoming.examples.length > 0 ? incoming.examples : base.examples,
    topics: uniqueStrings([...base.topics, ...incoming.topics]),
    radicals: uniqueStrings([...base.radicals, ...incoming.radicals]),
    characterIds: incoming.characterIds.length > 0 ? incoming.characterIds : base.characterIds,
    strokeCount: incoming.strokeCount ?? base.strokeCount,
    hskLevel: incoming.hskLevel ?? base.hskLevel,
    source: 'imported',
    importSourceLabel: incoming.importSourceLabel,
  }
}

function persistImportedWords(words: WordEntry[]) {
  try {
    const importedWords = words.filter((word) => word.source === 'imported')
    localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(importedWords))
  } catch {}
}

function loadImportedWords(): ImportedWordEntry[] {
  try {
    const raw = localStorage.getItem(IMPORT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistTopics(topics: TopicEntry[], message: string) {
  try {
    localStorage.setItem(TOPIC_CACHE_STORAGE_KEY, JSON.stringify(topics))
    localStorage.setItem(TOPIC_SYNC_MESSAGE_KEY, message)
  } catch {}
}

function loadTopicCache() {
  try {
    const raw = localStorage.getItem(TOPIC_CACHE_STORAGE_KEY)
    const topics: TopicEntry[] = raw ? JSON.parse(raw) : []
    const message = localStorage.getItem(TOPIC_SYNC_MESSAGE_KEY) ?? ''
    return { topics, message }
  } catch {
    return { topics: [] as TopicEntry[], message: '' }
  }
}

function dedupeWords(words: WordEntry[]) {
  const merged = new Map<string, WordEntry>()

  for (const word of words) {
    const key = `${word.simplified}::${word.pinyin}`.toLowerCase()
    const current = merged.get(key)
    if (!current) {
      merged.set(key, word)
      continue
    }

    merged.set(
      key,
      mergeWordEntries(
        current,
        {
          ...word,
          source: word.source ?? 'imported',
          importSourceLabel: word.source === 'imported' ? 'deduped' : undefined,
        },
      ),
    )
  }

  return Array.from(merged.values())
}

function buildFallbackTopics(words: WordEntry[]): TopicEntry[] {
  const topicMap = new Map<string, TopicEntry>()

  for (const word of words) {
    for (const topicName of word.topics) {
      const name = topicName.trim()
      if (!name) continue
      const id = slugify(name)
      const topic = topicMap.get(id) ?? {
        id,
        name,
        slug: id,
        wordIds: [],
        source: 'local-fallback' as const,
      }
      if (!topic.wordIds.includes(word.id)) topic.wordIds.push(word.id)
      topicMap.set(id, topic)
    }
  }

  return Array.from(topicMap.values()).sort((a, b) => {
    if (b.wordIds.length !== a.wordIds.length) return b.wordIds.length - a.wordIds.length
    return a.name.localeCompare(b.name)
  })
}

function mergeBuiltinAndImported(importedWords: ImportedWordEntry[]) {
  const keyedImported = new Map(
    importedWords.map((word) => [`${word.simplified}::${word.pinyin}`.toLowerCase(), word]),
  )

  const merged = builtinWords.map((word) => {
    const imported = keyedImported.get(`${word.simplified}::${word.pinyin}`.toLowerCase())
    return imported ? mergeWordEntries(word, imported) : word
  })

  for (const imported of importedWords) {
    const key = `${imported.simplified}::${imported.pinyin}`.toLowerCase()
    if (!merged.some((word) => `${word.simplified}::${word.pinyin}`.toLowerCase() === key)) {
      merged.push({
        ...imported,
        source: imported.source ?? 'imported',
      })
    }
  }

  return dedupeWords(merged)
}

const initialImportedWords = loadImportedWords()
const initialWords = mergeBuiltinAndImported(initialImportedWords)
const initialFallbackTopics = buildFallbackTopics(initialWords)
const cachedTopics = loadTopicCache()

export const useVocabularyStore = create<VocabularyStore>((setState, getState) => ({
  words: initialWords,
  officialTopics: cachedTopics.topics.length > 0 ? cachedTopics.topics : initialFallbackTopics,
  syncStatus: cachedTopics.topics.length > 0 ? 'local-fallback' : 'idle',
  syncMessage: cachedTopics.message,
  initialized: false,

  async init() {
    if (getState().initialized || getState().syncStatus === 'loading') return

    setState({
      initialized: true,
      syncStatus: 'loading',
      officialTopics: getState().officialTopics.length > 0 ? getState().officialTopics : buildFallbackTopics(getState().words),
    })

    const fallbackTopics = buildFallbackTopics(getState().words)
    const result = await syncHanziiTopicCatalog(fallbackTopics)
    persistTopics(result.topics, result.message)

    setState({
      officialTopics: result.topics,
      syncStatus: result.status,
      syncMessage: result.message,
    })
  },

  upsertImportedWords(words, sourceLabel) {
    const state = getState()
    const wordMap = new Map(state.words.map((word) => [`${word.simplified}::${word.pinyin}`.toLowerCase(), word]))
    const mergedWords = [...state.words]
    const wordIds: string[] = []
    let createdWords = 0
    let updatedWords = 0

    for (const word of words) {
      const normalized: ImportedWordEntry = {
        ...word,
        source: (word.source ?? 'imported') as VocabularySource,
        importSourceLabel: sourceLabel,
      }
      const key = `${normalized.simplified}::${normalized.pinyin}`.toLowerCase()
      const existing = wordMap.get(key)

      if (existing) {
        const next = mergeWordEntries(existing, normalized)
        const index = mergedWords.findIndex((entry) => entry.id === existing.id)
        if (index >= 0) mergedWords[index] = next
        wordMap.set(key, next)
        wordIds.push(next.id)
        updatedWords += 1
      } else {
        mergedWords.push(normalized)
        wordMap.set(key, normalized)
        wordIds.push(normalized.id)
        createdWords += 1
      }
    }

    const deduped = dedupeWords(mergedWords)
    const nextTopics = buildFallbackTopics(deduped)
    persistImportedWords(deduped)

    setState((current) => ({
      words: deduped,
      officialTopics: current.syncStatus === 'runtime' ? current.officialTopics : nextTopics,
    }))

    return { createdWords, updatedWords, wordIds }
  },
}))

export function bootstrapVocabularySync() {
  return useVocabularyStore.getState().init()
}

export function getVocabularyWords() {
  return useVocabularyStore.getState().words
}

export function getVocabularyWordById(id: string) {
  return useVocabularyStore.getState().words.find((word) => word.id === id)
}

export function getVocabularyWordMap() {
  return new Map(useVocabularyStore.getState().words.map((word) => [word.id, word]))
}
