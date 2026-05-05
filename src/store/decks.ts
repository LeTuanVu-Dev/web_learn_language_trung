import { create } from 'zustand'
import { DeckEntry } from '../types'

const STORAGE_KEY = 'hanzixue_decks'

const builtinDecks: DeckEntry[] = [
  { id: 'hsk1', name: 'HSK 1 (150 từ)', wordIds: [], isCustom: false, createdAt: 0 },
]

function load(): DeckEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const custom: DeckEntry[] = raw ? JSON.parse(raw) : []
    return [...builtinDecks, ...custom]
  } catch {
    return builtinDecks
  }
}

function saveCustom(decks: DeckEntry[]) {
  try {
    const custom = decks.filter((deck) => deck.isCustom)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
  } catch {}
}

interface DecksStore {
  decks: DeckEntry[]
  createDeck: (name: string, wordIds?: string[]) => string
  deleteDeck: (id: string) => void
  addWord: (deckId: string, wordId: string) => void
  removeWord: (deckId: string, wordId: string) => void
  renameDeck: (deckId: string, name: string) => void
}

export const useDecks = create<DecksStore>((setState) => ({
  decks: load(),

  createDeck(name, wordIds = []) {
    const id = `custom_${Date.now()}`
    const deck: DeckEntry = { id, name, wordIds, isCustom: true, createdAt: Date.now() }
    setState((prev) => {
      const next = [...prev.decks, deck]
      saveCustom(next)
      return { decks: next }
    })
    return id
  },

  deleteDeck(id) {
    setState((prev) => {
      const next = prev.decks.filter((deck) => deck.id !== id || !deck.isCustom)
      saveCustom(next)
      return { decks: next }
    })
  },

  addWord(deckId, wordId) {
    setState((prev) => {
      const next = prev.decks.map((deck) =>
        deck.id === deckId && deck.isCustom && !deck.wordIds.includes(wordId)
          ? { ...deck, wordIds: [...deck.wordIds, wordId] }
          : deck,
      )
      saveCustom(next)
      return { decks: next }
    })
  },

  removeWord(deckId, wordId) {
    setState((prev) => {
      const next = prev.decks.map((deck) =>
        deck.id === deckId && deck.isCustom
          ? { ...deck, wordIds: deck.wordIds.filter((id) => id !== wordId) }
          : deck,
      )
      saveCustom(next)
      return { decks: next }
    })
  },

  renameDeck(deckId, name) {
    setState((prev) => {
      const next = prev.decks.map((deck) =>
        deck.id === deckId && deck.isCustom ? { ...deck, name } : deck,
      )
      saveCustom(next)
      return { decks: next }
    })
  },
}))

export function getDeckWords(deckId: string, allWords: import('../types').WordEntry[]) {
  if (deckId === 'hsk1') return allWords.filter((word) => word.hskLevel === 1)
  const { decks } = useDecks.getState()
  const deck = decks.find((entry) => entry.id === deckId)
  if (!deck) return []
  const wordMap = new Map(allWords.map((word) => [word.id, word]))
  return deck.wordIds.map((id) => wordMap.get(id)).filter(Boolean) as import('../types').WordEntry[]
}
