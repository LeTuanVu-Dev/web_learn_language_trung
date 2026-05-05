import { WordEntry } from '../types'
import { hsk1Words } from './hsk1'
import { commonRadicals as rawCommonRadicals } from './radicals'

const cp1252ReverseMap = new Map<number, number>([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84], [0x2026, 0x85],
  [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88], [0x2030, 0x89], [0x0160, 0x8a],
  [0x2039, 0x8b], [0x0152, 0x8c], [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92],
  [0x201c, 0x93], [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b], [0x0153, 0x9c],
  [0x017e, 0x9e], [0x0178, 0x9f],
])

function decodeMojibake(value: string): string {
  if (!/[ÃÂÆÐÑÒÓÔÕÙÚÝà-ÿçåæäï]/.test(value)) return value

  try {
    const bytes = Uint8Array.from(Array.from(value).map((char) => {
      const code = char.charCodeAt(0)
      if (code <= 0xff) return code

      const mapped = cp1252ReverseMap.get(code)
      if (mapped !== undefined) return mapped

      throw new Error('not cp1252 mojibake')
    }))

    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return value
  }
}

function normalizeValue<T>(value: T): T {
  if (typeof value === 'string') return decodeMojibake(value) as T
  if (Array.isArray(value)) return value.map((entry) => normalizeValue(entry)) as T

  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(([key, entry]) => [key, normalizeValue(entry)])
    return Object.fromEntries(entries) as T
  }

  return value
}

export const commonRadicals = normalizeValue(rawCommonRadicals)
export const allWords: WordEntry[] = normalizeValue(hsk1Words)

export const wordById = new Map<string, WordEntry>(allWords.map((word) => [word.id, word]))
export const wordByHanzi = new Map<string, WordEntry>(allWords.map((word) => [word.hanzi, word]))

export function getWordsByHsk(level: number): WordEntry[] {
  return allWords.filter((word) => word.hskLevel === level)
}

export function getWordsByTopic(topic: string): WordEntry[] {
  return allWords.filter((word) => word.topics.includes(topic))
}

export function getWordsByRadical(radical: string): WordEntry[] {
  return allWords.filter((word) => word.radicals.includes(radical))
}

export function getAllTopics(): string[] {
  const set = new Set<string>()
  allWords.forEach((word) => word.topics.forEach((topic) => set.add(topic)))
  return Array.from(set).sort()
}

export function getAllRadicals(): string[] {
  const set = new Set<string>()
  allWords.forEach((word) => word.radicals.forEach((radical) => set.add(radical)))
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
}

export function getHskLevels(): number[] {
  const set = new Set<number>()
  allWords.forEach((word) => {
    if (word.hskLevel) set.add(word.hskLevel)
  })
  return Array.from(set).sort((a, b) => a - b)
}

export function getDataStats() {
  return {
    wordCount: allWords.length,
    topicCount: getAllTopics().length,
    radicalCount: getAllRadicals().length,
    hskLevels: getHskLevels(),
  }
}

export const hsk1WordsNormalized = allWords
