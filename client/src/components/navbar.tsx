import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Power, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

export const NavBar = () => {
  const { toast } = useToast()
  const shutdown = async () => {
    try {
      const resp = await fetch('/api/power/shutdown', { method: 'POST' })
      if (!resp.ok) {
        const { error }: { error: string } = await resp.json()
        throw new Error(error)
      }
    } catch (err) {
      toast({
        title: 'Error!',
        description: `Failed to shutdown: ${err}`,
        variant: 'destructive'
      })
    }
  }
  const reboot = async () => {
    try {
      const resp = await fetch('/api/power/reboot', { method: 'POST' })
      if (!resp.ok) {
        const { error }: { error: string } = await resp.json()
        throw new Error(error)
      }
    } catch (err) {
      toast({
        title: 'Error!',
        description: `Failed to reboot: ${err}`,
        variant: 'destructive'
      })
    }
  }

  return (
    <nav className='flex justify-center items-center py-4 px-4 sm:px-6 lg:px-8'>
      <Button variant='ghost' asChild>
        <Link to='/'>
          <h4 className='text-xl font-semibold'>Durango Portal</h4>
        </Link>
      </Button>
      <Button variant='ghost' asChild>
        <Link to='/taskmgr'>Task Manager</Link>
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
