import { lazy, Suspense, type ReactNode } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })))
const Library = lazy(() => import('./pages/Library').then((module) => ({ default: module.Library })))
const Flashcards = lazy(() => import('./pages/Flashcards').then((module) => ({ default: module.Flashcards })))
const Quiz = lazy(() => import('./pages/Quiz').then((module) => ({ default: module.Quiz })))
const Write = lazy(() => import('./pages/Write').then((module) => ({ default: module.Write })))
const Decks = lazy(() => import('./pages/Decks').then((module) => ({ default: module.Decks })))
const CharacterDetail = lazy(() => import('./pages/CharacterDetail').then((module) => ({ default: module.CharacterDetail })))
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })))
const Lesson = lazy(() => import('./pages/Lesson').then((module) => ({ default: module.Lesson })))

function PageShell({ children }: { children: ReactNode }) {
  return (
    <Layout>
      <Suspense fallback={<div className="py-8 text-center text-sm text-gray-600">Dang tai...</div>}>
        {children}
      </Suspense>
    </Layout>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<PageShell><Home /></PageShell>} path="/" />
        <Route element={<PageShell><Library /></PageShell>} path="/library" />
        <Route element={<PageShell><Flashcards /></PageShell>} path="/flashcards" />
        <Route element={<PageShell><Quiz /></PageShell>} path="/quiz" />
        <Route element={<PageShell><Write /></PageShell>} path="/write" />
        <Route element={<PageShell><Decks /></PageShell>} path="/decks" />
        <Route element={<PageShell><CharacterDetail /></PageShell>} path="/character/:id" />
        <Route element={<PageShell><Settings /></PageShell>} path="/settings" />
        <Route element={<PageShell><Lesson /></PageShell>} path="/lesson" />
      </Routes>
    </HashRouter>
  )
}
