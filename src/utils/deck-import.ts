import * as XLSX from 'xlsx'
import { DeckImportPreview, ImportedWordEntry } from '../types'

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '')
}

function splitMultiValue(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[;,/|]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )
}

function parseRows(rows: Record<string, unknown>[], sourceLabel: string): DeckImportPreview {
  const errors: string[] = []
  const wordMap = new Map<string, ImportedWordEntry>()
  let validRows = 0

  rows.forEach((row, index) => {
    const fields = new Map(
      Object.entries(row).map(([key, value]) => [normalizeHeader(key), String(value ?? '').trim()]),
    )

    const hanzi = fields.get('hanzi') || fields.get('chinese') || fields.get('word') || fields.get('simplified')
    const pinyin = fields.get('pinyin') || fields.get('pronunciation') || ''
    const meaningsVi = splitMultiValue(fields.get('vi') || fields.get('meaningvi') || fields.get('vietnamese') || '')
    const meaningsEn = splitMultiValue(fields.get('en') || fields.get('meaningen') || fields.get('english') || '')
    const topics = splitMultiValue(fields.get('topic') || fields.get('topics') || fields.get('category') || '')
    const radicals = splitMultiValue(fields.get('radical') || fields.get('radicals') || '')
    const exampleZh = fields.get('examplezh') || fields.get('example') || ''
    const examplePinyin = fields.get('examplepinyin') || ''
    const exampleVi = fields.get('examplevi') || ''
    const exampleEn = fields.get('exampleen') || ''
    const hskRaw = fields.get('hsk') || fields.get('level') || ''
    const hskLevel = Number.parseInt(hskRaw || '', 10)

    if (!hanzi) {
      errors.push(`Dong ${index + 2}: thieu cot hanzi/chinese/word.`)
      return
    }

    if (!pinyin && meaningsVi.length === 0 && meaningsEn.length === 0) {
      errors.push(`Dong ${index + 2}: can it nhat pinyin hoac nghia VI/EN.`)
      return
    }

    validRows += 1
    const key = `${hanzi}::${pinyin}`.toLowerCase()
    const existing = wordMap.get(key)
    const next: ImportedWordEntry = {
      id: existing?.id ?? `import-${Date.now()}-${index + 1}`,
      hanzi,
      simplified: hanzi,
      traditional: undefined,
      pinyin,
      meaningsVi: Array.from(new Set([...(existing?.meaningsVi ?? []), ...meaningsVi])),
      meaningsEn: Array.from(new Set([...(existing?.meaningsEn ?? []), ...meaningsEn])),
      examples: exampleZh
        ? [{
          zh: exampleZh,
          pinyin: examplePinyin || undefined,
          vi: exampleVi || undefined,
          en: exampleEn || undefined,
        }]
        : (existing?.examples ?? []),
      hskLevel: Number.isFinite(hskLevel) ? hskLevel : existing?.hskLevel,
      topics: Array.from(new Set([...(existing?.topics ?? []), ...topics])),
      radicals: Array.from(new Set([...(existing?.radicals ?? []), ...radicals])),
      characterIds: Array.from(hanzi),
      source: 'imported',
      importSourceLabel: sourceLabel,
    }

    wordMap.set(key, next)
  })

  const words = Array.from(wordMap.values())

  return {
    rowsRead: rows.length,
    validRows,
    invalidRows: errors.length,
    createdWords: words.length,
    updatedWords: 0,
    wordIds: words.map((word) => word.id),
    words,
    errors,
  }
}

export async function parseDeckImportFile(file: File): Promise<DeckImportPreview> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' })
  return parseRows(rows, file.name)
}
