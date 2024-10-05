import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Power, RotateCcw } from 'lucide-react'

export const NavBar = () => {
  const shutdown = async () => {
    await fetch('/api/power/shutdown', { method: 'POST' })
  }
  const reboot = async () => {
    await fetch('/api/power/restart', { method: 'POST' })
  }

  return (
    <nav className='flex justify-center items-center py-4 px-4 sm:px-6 lg:px-8'>
      <Button variant='ghost'>
        <h4 className='text-xl font-semibold'>Durango Portal</h4>
      </Button>
      <div className='ml-auto flex gap-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='icon'>
              <Power className='h-4 w-4' />
              <span className='sr-only'>Power</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Power</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={shutdown}>
              <Power className='h-4 w-4 mr-2' />
              Shutdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={reboot}>
              <RotateCcw className='h-4 w-4 mr-2' />
              Reboot
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
