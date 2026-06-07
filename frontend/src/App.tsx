import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { ZoneDetailPage } from './pages/ZoneDetailPage'
import { ZonesPage } from './pages/ZonesPage'

function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg shadow-cyan-500/25 transition group-hover:scale-105">
            <svg className="h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse-glow rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </span>
          <div>
            <p className="text-base font-bold tracking-tight text-slate-50">Monitor Industrial</p>
            <p className="text-xs text-slate-500">Sensores & Zonas</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            to="/"
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              isHome ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            Zonas
          </Link>
        </nav>

        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="hidden text-xs font-medium text-emerald-200 sm:inline">API conectada</span>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-slate-500 sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <p>Panel de monitoreo industrial · Prueba técnica</p>
        <p className="text-slate-600">React + TypeScript + Tailwind</p>
      </div>
    </footer>
  )
}

function AppBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[#020617]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.18),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.08),transparent_40%)]" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-slate-100">
        <AppBackground />
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<ZonesPage />} />
            <Route path="/zones/:id" element={<ZoneDetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
