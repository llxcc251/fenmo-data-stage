import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'

const Overview = lazy(() => import('./pages/Overview'))
const RoleGraph = lazy(() => import('./pages/RoleGraph'))
const MelodyFlow = lazy(() => import('./pages/MelodyFlow'))
const PlayUniverse = lazy(() => import('./pages/PlayUniverse'))
const HeritageMap = lazy(() => import('./pages/HeritageMap'))
const FaceGenerator = lazy(() => import('./pages/FaceGenerator'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
      <p className="text-ink-500 animate-pulse text-sm">加载中...</p>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
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
    </Layout>
  )
}
