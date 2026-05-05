import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Library } from './pages/Library'
import { Flashcards } from './pages/Flashcards'
import { Quiz } from './pages/Quiz'
import { Write } from './pages/Write'
import { Decks } from './pages/Decks'
import { CharacterDetail } from './pages/CharacterDetail'
import { Settings } from './pages/Settings'
import { Lesson } from './pages/Lesson'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout><Home /></Layout>} path="/" />
        <Route element={<Layout><Library /></Layout>} path="/library" />
        <Route element={<Layout><Flashcards /></Layout>} path="/flashcards" />
        <Route element={<Layout><Quiz /></Layout>} path="/quiz" />
        <Route element={<Layout><Write /></Layout>} path="/write" />
        <Route element={<Layout><Decks /></Layout>} path="/decks" />
        <Route element={<Layout><CharacterDetail /></Layout>} path="/character/:id" />
        <Route element={<Layout><Settings /></Layout>} path="/settings" />
        <Route element={<Layout><Lesson /></Layout>} path="/lesson" />
      </Routes>
    </HashRouter>
  )
}
