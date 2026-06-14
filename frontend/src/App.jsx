import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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
        <div className="h-6 w-32 bg-paper-200/80 rounded" />
        <div className="h-3 w-48 bg-paper-200/80 rounded mt-2" />
      </div>
      <SkeletonCard count={6} />
    </div>
  )
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/overview" element={<PageTransition><Overview /></PageTransition>} />
              <Route path="/roles" element={<PageTransition><RoleGraph /></PageTransition>} />
              <Route path="/melody" element={<PageTransition><MelodyFlow /></PageTransition>} />
              <Route path="/heritage" element={<PageTransition><HeritageMap /></PageTransition>} />
              <Route path="/face-generator" element={<PageTransition><FaceGenerator /></PageTransition>} />
              <Route path="/plays" element={<PageTransition><PlayUniverse /></PageTransition>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  )
}
