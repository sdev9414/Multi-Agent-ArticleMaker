import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

// Route → page title. Keeps Topbar dumb and pages free of title boilerplate.
const TITLES = {
  '/dashboard': 'Dashboard',
  '/create': 'Create Article',
  '/history': 'History',
  '/settings': 'Settings',
}

function titleFor(pathname) {
  if (pathname.startsWith('/articles/')) return 'Article'
  return TITLES[pathname] ?? 'Newsroom'
}

/** App shell for tool surfaces: sidebar + topbar + scrollable main. */
export default function AppLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={titleFor(pathname)} />
        <main className="flex-1 px-6 py-8 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
