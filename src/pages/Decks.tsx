import { ChangeEvent, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useDecks } from '../store/decks'
import { useVocabularyStore } from '../store/vocabulary'
import { parseDeckImportFile } from '../utils/deck-import'
import { DeckImportPreview } from '../types'

export function Decks() {
  const { decks, createDeck, deleteDeck } = useDecks()
  const { officialTopics, words, upsertImportedWords } = useVocabularyStore((state) => ({
    officialTopics: state.officialTopics,
    words: state.words,
    upsertImportedWords: state.upsertImportedWords,
  }))
  const [newName, setNewName] = useState('')
  const [selectedTopicId, setSelectedTopicId] = useState(officialTopics[0]?.id ?? '')
  const [importPreview, setImportPreview] = useState<DeckImportPreview | null>(null)
  const [importName, setImportName] = useState('')
  const [importing, setImporting] = useState(false)

  const topicMap = useMemo(() => new Map(officialTopics.map((topic) => [topic.id, topic])), [officialTopics])

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    createDeck(name)
    setNewName('')
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const preview = await parseDeckImportFile(file)
      setImportPreview(preview)
      setImportName(file.name.replace(/\.[^.]+$/, ''))
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  function applyImport() {
    if (!importPreview) return
    const result = upsertImportedWords(importPreview.words, importName || 'Imported file')
    createDeck(importName || 'Imported deck', result.wordIds, {
      sourceType: 'imported-file',
      sourceLabel: importName || 'Imported file',
      importedCount: result.wordIds.length,
    })
    setImportPreview({
      ...importPreview,
      createdWords: result.createdWords,
      updatedWords: result.updatedWords,
      wordIds: result.wordIds,
    })
  }

  function createFromTopic() {
    const topic = topicMap.get(selectedTopicId)
    if (!topic) return
    createDeck(topic.name, topic.wordIds, {
      sourceType: 'topic-generated',
      sourceLabel: topic.name,
      importedCount: topic.wordIds.length,
    })
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <h1 className="text-lg font-semibold text-gray-900">Bo the</h1>

      <div className="rounded-2xl border border-border bg-surface-2 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ten bo the moi..."
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleCreate()}
            className="flex-1 rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-pinyin"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="rounded-xl border border-pinyin/50 bg-pinyin/10 px-4 py-2.5 text-sm font-medium text-pinyin transition-colors hover:bg-pinyin/20 disabled:opacity-40"
          >
            Tao
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4">
        <div>
          <p className="text-sm font-medium text-gray-900">Import tu file</p>
          <p className="text-xs text-gray-600">Ho tro CSV/XLSX voi cac cot: hanzi, pinyin, vi, en, topic, hsk, example.</p>
        </div>
        <label className="inline-flex w-fit cursor-pointer rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-gray-800 transition-colors hover:border-pinyin hover:text-pinyin">
          {importing ? 'Dang doc file...' : 'Chon file Excel / CSV'}
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
        </label>

        {importPreview && (
          <div className="rounded-xl border border-border bg-white p-4 text-sm text-gray-800">
            <p className="font-medium text-gray-900">Preview import: {importName || 'Imported file'}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
              <p>{importPreview.rowsRead} dong doc duoc</p>
              <p>{importPreview.validRows} dong hop le</p>
              <p>{importPreview.invalidRows} dong loi</p>
              <p>{importPreview.words.length} tu sau khi dedupe</p>
            </div>

            {importPreview.errors.length > 0 && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {importPreview.errors.slice(0, 5).map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}

            <button
              onClick={applyImport}
              className="mt-3 rounded-xl border border-pinyin/50 bg-pinyin/10 px-4 py-2.5 text-sm font-medium text-pinyin transition-colors hover:bg-pinyin/20"
            >
              Import vao deck
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4">
        <div>
          <p className="text-sm font-medium text-gray-900">Tao theo chu de</p>
          <p className="text-xs text-gray-600">Lay toi da tu vung co san trong chu de da dong bo/cache.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTopicId}
            onChange={(event) => setSelectedTopicId(event.target.value)}
            className="flex-1 rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-pinyin"
          >
            {officialTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name} ({topic.wordIds.length})
              </option>
            ))}
          </select>
          <button
            onClick={createFromTopic}
            disabled={!selectedTopicId}
            className="rounded-xl border border-pinyin/50 bg-pinyin/10 px-4 py-2.5 text-sm font-medium text-pinyin transition-colors hover:bg-pinyin/20 disabled:opacity-40"
          >
            Tao tu chu de
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-4"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{deck.name}</p>
              <p className="mt-0.5 text-xs text-gray-600">
                {deck.isCustom ? `${deck.wordIds.length} tu` : `${words.filter((word) => word.hskLevel === Number(deck.id.replace('hsk', ''))).length} tu`}
                {deck.sourceLabel ? ` · ${deck.sourceLabel}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <NavLink
                to={`/flashcards?deck=${deck.id}`}
                className="rounded-lg border border-pinyin/40 px-3 py-1.5 text-xs text-pinyin transition-colors hover:bg-pinyin/10"
              >
                Flashcard
              </NavLink>
              <NavLink
                to={`/quiz?deck=${deck.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-gray-800 transition-colors hover:border-gray-500"
              >
                Quiz
              </NavLink>
              {deck.isCustom && (
                <button
                  onClick={() => deleteDeck(deck.id)}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-700 transition-colors hover:bg-red-50"
                >
                  Xoa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
