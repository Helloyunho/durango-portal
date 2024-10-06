import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Root } from './pages/root'
import { TaskMgr } from './pages/taskmgr'
import { Toaster } from '@/components/ui/toaster'
import './index.css'
import { Index } from './pages'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Index />
      },
      {
        path: 'taskmgr',
        element: <TaskMgr />
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>
)
