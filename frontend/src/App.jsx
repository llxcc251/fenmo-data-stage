import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import SkeletonCard from './components/SkeletonCard'
import Home from './pages/Home'

const Overview = lazy(() => import('./pages/Overview'))
const RoleGraph = lazy(() => import('./pages/RoleGraph'))
const MelodyFlow = lazy(() => import('./pages/MelodyFlow'))
const PlayUniverse = lazy(() => import('./pages/PlayUniverse'))
const HeritageMap = lazy(() => import('./pages/HeritageMap'))
const FaceGenerator = lazy(() => import('./pages/FaceGenerator'))

function PageLoader() {
  return (
    <div className="space-y-6 p-6">
      <div className="animate-pulse">
        <div className="h-6 w-32 bg-ink-600/20 rounded" />
        <div className="h-3 w-48 bg-ink-600/20 rounded mt-2" />
      </div>
      <SkeletonCard count={6} />
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/roles" element={<RoleGraph />} />
            <Route path="/melody" element={<MelodyFlow />} />
            <Route path="/plays" element={<PlayUniverse />} />
            <Route path="/heritage" element={<HeritageMap />} />
            <Route path="/face-generator" element={<FaceGenerator />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  )
}
