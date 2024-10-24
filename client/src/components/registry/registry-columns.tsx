import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Trash,
  X,
  ArrowUp,
  ArrowDown,
  Edit
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
// import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import type { ErrorContainer } from '@/types/error'
import { kindToString, RegistryValue } from '@/types/registry'
import { RegistryEditDialog } from './registry-edit-value-dialog'

const deleteValue = async (trace: string[]) => {
  try {
    const query = trace.join('\\')
    const encodedQuery = encodeURIComponent(query)
    const resp = await fetch(`/api/registry/value?id=${encodedQuery}`, {
      method: 'DELETE'
    })
    if (!resp.ok) {
      const { message, stackTrace }: ErrorContainer = await resp.json()
      throw new Error(`${message}: ${stackTrace}`)
    }
  } catch (err) {
    toast({
      title: 'Error!',
      description: `Failed to delete value: ${err}`,
      variant: 'destructive'
    })
  }
}

export const registryColumns: ColumnDef<RegistryValue & { trace: string[] }>[] =
  [
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
      accessorKey: 'key',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Key
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className='h-4 w-4 ml-2' />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className='h-4 w-4 ml-2' />
          ) : null}
        </Button>
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('key')}</div>
      ),
      meta: {
        name: 'Key'
      }
    },
    {
      accessorKey: 'kind',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Kind
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className='h-4 w-4 ml-2' />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className='h-4 w-4 ml-2' />
          ) : null}
        </Button>
      ),
      cell: ({ row }) => <div>{kindToString(row.getValue('kind'))}</div>,
      meta: {
        name: 'Kind'
      }
    },
    {
      accessorKey: 'value',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Value
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className='h-4 w-4 ml-2' />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className='h-4 w-4 ml-2' />
          ) : null}
        </Button>
      ),
      meta: {
        name: 'Value'
      }
    },
    {
      accessorKey: 'actions',
      enableHiding: false,
      header: () => <div className='sr-only'>Actions</div>,
      cell: ({ row }) => {
        // seems like this is a react hook component
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [removeAlertOpen, setRemoveAlertOpen] = React.useState(false)
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [editDialogOpen, setEditDialogOpen] = React.useState(false)
        const key = row.getValue('key') as string
        const trace = row.original.trace

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className='h-4 w-4 mr-2' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive hover:text-destructive/90'
                  onClick={() => setRemoveAlertOpen(true)}
                >
                  <Trash className='h-4 w-4 mr-2' /> Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog
              open={removeAlertOpen}
              onOpenChange={setRemoveAlertOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will delete value {key}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <X className='w-4 h-4 mr-2' />
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteValue([...trace, key])}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  >
                    <Trash className='w-4 h-4 mr-2' />
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <RegistryEditDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              value={row.original}
            />
          </>
        )
      }
    }
  ]
