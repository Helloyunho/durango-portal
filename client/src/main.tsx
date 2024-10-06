import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Index } from './pages'
import { Toaster } from '@/components/ui/toaster'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>
)
