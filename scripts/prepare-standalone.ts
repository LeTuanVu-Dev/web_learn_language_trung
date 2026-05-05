import { cp, rm, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

async function replaceDir(from: string, to: string) {
  await rm(to, { recursive: true, force: true })
  await cp(from, to, { recursive: true })
}

async function main() {
  await copyFile(path.join(distDir, 'index.html'), path.join(rootDir, 'RUN_THIS.html'))
  await replaceDir(path.join(distDir, 'hanzi'), path.join(rootDir, 'hanzi'))
  await replaceDir(path.join(distDir, 'data'), path.join(rootDir, 'data'))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
