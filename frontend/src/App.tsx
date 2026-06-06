import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { ZoneDetailPage } from './pages/ZoneDetailPage'
import { ZonesPage } from './pages/ZonesPage'

function Navbar() {
  return (
    <header className="border-b border-cyan-400/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold uppercase tracking-[0.24em] text-cyan-300">
          Monitor Industrial
        </Link>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
          Backend en localhost:3000/api
        </span>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.14),_transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,1))]" />
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<ZonesPage />} />
            <Route path="/zones/:id" element={<ZoneDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}