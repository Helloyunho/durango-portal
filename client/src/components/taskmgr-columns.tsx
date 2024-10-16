import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, LogOut, X, ArrowUp, ArrowDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
// import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import type { Process } from '@/types/process'
import type { ErrorContainer } from '@/types/error'

const kill = async (pid: number) => {
  try {
    const resp = await fetch(`/api/process?id=${pid}`, { method: 'DELETE' })
    if (!resp.ok) {
      const { message, stackTrace }: ErrorContainer = await resp.json()
      throw new Error(`${message}: ${stackTrace}`)
    }
  } catch (err) {
    toast({
      title: 'Error!',
      description: `Failed to kill process: ${err}`,
      variant: 'destructive'
    })
  }
}

export const taskMgrColumns: ColumnDef<Process>[] = [
  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && 'indeterminate')
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label='Select all'
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label='Select row'
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false
  // },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Process ID
        {column.getIsSorted() === 'asc' ? (
          <ArrowUp className='h-4 w-4 ml-2' />
        ) : column.getIsSorted() === 'desc' ? (
          <ArrowDown className='h-4 w-4 ml-2' />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => <div className='font-medium'>{row.getValue('id')}</div>,
    meta: {
      name: 'Process ID'
    }
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Process Name
        {column.getIsSorted() === 'asc' ? (
          <ArrowUp className='h-4 w-4 ml-2' />
        ) : column.getIsSorted() === 'desc' ? (
          <ArrowDown className='h-4 w-4 ml-2' />
        ) : null}
      </Button>
    ),
    meta: {
      name: 'Process Name'
    }
  },
  {
    accessorKey: 'memory',
    header: ({ column }) => (
      <div className='flex justify-end'>
        <Button
          variant='ghost'
          onClick={() =>
            column.toggleSorting(
              !column.getIsSorted() ? true : column.getIsSorted() === 'asc'
            )
          }
          className='text-right'
        >
          Mem Usage (MB)
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className='h-4 w-4 ml-2' />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className='h-4 w-4 ml-2' />
          ) : null}
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className='text-right'>
        {((row.getValue('memory') as number) / 1024 / 1024).toFixed(2)}
      </div>
    ),
    meta: {
      name: 'Mem Usage (MB)'
    }
  },
  {
    accessorKey: 'responding',
    header: () => <div className='text-right'>Status</div>,
    cell: ({ row }) => (
      <div className='text-right'>
        {row.getValue('responding') ? 'Running' : 'Not Responding'}
      </div>
    ),
    meta: {
      name: 'Status'
    }
  },
  {
    accessorKey: 'actions',
    enableHiding: false,
    header: () => <div className='sr-only'>Actions</div>,
    cell: ({ row }) => {
      const id = row.getValue('id') as number
      const name = row.getValue('name') as string

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className='text-destructive hover:text-destructive/90'>
                  <LogOut className='h-4 w-4 mr-2' /> Kill
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will kill {name}
                    (PID: {id}).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <X className='w-4 h-4 mr-2' />
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => kill(id)}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  >
                    <LogOut className='w-4 h-4 mr-2' />
                    Kill
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
