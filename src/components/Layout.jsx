import { useLocation } from 'react-router-dom'
import Navigation from './Navigation'

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main key={location.pathname} className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
