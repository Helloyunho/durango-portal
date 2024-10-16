import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Trash, X, ArrowUp, ArrowDown } from 'lucide-react'

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
import type { ErrorContainer } from '@/types/error'
import type { Package } from '@/types/package'

const removePackage = async (id: string) => {
  try {
    const resp = await fetch(`/api/app?id=${id}`, { method: 'DELETE' })
    if (!resp.ok) {
      const { message, stackTrace }: ErrorContainer = await resp.json()
      throw new Error(`${message}: ${stackTrace}`)
    }
  } catch (err) {
    toast({
      title: 'Error!',
      description: `Failed to remove package: ${err}`,
      variant: 'destructive'
    })
  }
}

export const packageColumns: ColumnDef<Package>[] = [
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
        Package ID
        {column.getIsSorted() === 'asc' ? (
          <ArrowUp className='h-4 w-4 ml-2' />
        ) : column.getIsSorted() === 'desc' ? (
          <ArrowDown className='h-4 w-4 ml-2' />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => <div className='font-medium'>{row.getValue('id')}</div>,
    meta: {
      name: 'Package ID'
    }
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Package Name
        {column.getIsSorted() === 'asc' ? (
          <ArrowUp className='h-4 w-4 ml-2' />
        ) : column.getIsSorted() === 'desc' ? (
          <ArrowDown className='h-4 w-4 ml-2' />
        ) : null}
      </Button>
    ),
    meta: {
      name: 'Package Name'
    }
  },
  {
    accessorKey: 'publisher',
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
          Publisher
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className='h-4 w-4 ml-2' />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className='h-4 w-4 ml-2' />
          ) : null}
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className='text-right'>{row.getValue('publisher')}</div>
    ),
    meta: {
      name: 'Publisher'
    }
  },
  {
    accessorKey: 'actions',
    enableHiding: false,
    header: () => <div className='sr-only'>Actions</div>,
    cell: ({ row }) => {
      const id = row.getValue('id') as string
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
                  <Trash className='h-4 w-4' /> Remove
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will remove package{' '}
                    {name} (ID: {id}).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <X className='w-4 h-4 mr-2' />
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => removePackage(id)}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  >
                    <Trash className='w-4 h-4 mr-2' />
                    Remove
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
