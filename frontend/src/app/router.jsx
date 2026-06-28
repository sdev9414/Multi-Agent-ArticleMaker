import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import LandingPage from '../features/landing/LandingPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import CreateArticlePage from '../features/articles/CreateArticlePage'
import ArticleViewerPage from '../features/articles/ArticleViewerPage'
import HistoryPage from '../features/history/HistoryPage'
import SettingsPage from '../features/settings/SettingsPage'
import NotFoundPage from './NotFoundPage'

export const router = createBrowserRouter([
  // Brand surface — full-bleed, no app chrome.
  { path: '/', element: <LandingPage /> },
  // Tool surfaces — inside the app shell.
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/create', element: <CreateArticlePage /> },
      { path: '/articles/:id', element: <ArticleViewerPage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
