import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { allWords, getAllTopics, getAllRadicals, getHskLevels } from '../src/data/index'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')
const hanziDir = path.join(publicDir, 'hanzi')
const dataDir = path.join(publicDir, 'data')
const generatedDir = path.join(rootDir, 'src', 'generated')

const require = createRequire(import.meta.url)
const hanziWriterDataRoot = path.dirname(require.resolve('hanzi-writer-data/package.json'))

function getUniqueChars() {
  const chars = new Set<string>()

  for (const word of allWords) {
    for (const char of Array.from(word.simplified || word.hanzi)) chars.add(char)
    for (const char of word.characterIds) chars.add(char)
  }

  return Array.from(chars).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
}

async function copyCharacterData() {
  const chars = getUniqueChars()
  const missing: string[] = []
  const embeddedData: Record<string, unknown> = {}

  await mkdir(hanziDir, { recursive: true })
  await mkdir(generatedDir, { recursive: true })

  await Promise.all(
    chars.map(async (char) => {
      const src = path.join(hanziWriterDataRoot, `${char}.json`)
      const dest = path.join(hanziDir, `${char}.json`)

      try {
        const content = await readFile(src, 'utf8')
        await copyFile(src, dest)
        embeddedData[char] = JSON.parse(content)
      } catch {
        missing.push(char)
      }
    }),
  )

  const moduleContent = `export const hanziCharacterData: Record<string, unknown> = ${JSON.stringify(embeddedData)};\n`
  await writeFile(path.join(generatedDir, 'hanzi-data.ts'), moduleContent, 'utf8')

  return { chars, missing }
}

async function writeLibraryData(chars: string[], missingChars: string[]) {
  await mkdir(dataDir, { recursive: true })

  const manifest = {
    generatedAt: new Date().toISOString(),
    stats: {
      wordCount: allWords.length,
      topicCount: getAllTopics().length,
      radicalCount: getAllRadicals().length,
      hskLevels: getHskLevels(),
      characterCount: chars.length,
      strokeAssetCount: chars.length - missingChars.length,
    },
    missingStrokeChars: missingChars,
  }

  const library = {
    words: allWords,
    topics: getAllTopics(),
    radicals: getAllRadicals(),
    hskLevels: getHskLevels(),
  }

  await writeFile(path.join(dataDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
  await writeFile(path.join(dataDir, 'library.json'), JSON.stringify(library, null, 2), 'utf8')
  await copyFile(
    path.join(hanziWriterDataRoot, 'ARPHICPL.TXT'),
    path.join(dataDir, 'stroke-license.txt'),
  )
}

async function main() {
  const { chars, missing } = await copyCharacterData()
  await writeLibraryData(chars, missing)

  if (missing.length > 0) {
    console.warn(`Missing stroke data for ${missing.length} character(s): ${missing.join(', ')}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
