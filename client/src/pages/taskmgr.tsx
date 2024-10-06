import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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

import { useToast } from '@/hooks/use-toast'
import { useSWRFetcher } from '@/lib/swr-fetcher'
import type { Process } from '@/types/process'
import { Loader2, X } from 'lucide-react'

export const TaskMgr = () => {
  const { toast } = useToast()
  const { isLoading, data, error } = useSWRFetcher<Process[]>(
    '/api/process',
    undefined,
    {
      refreshInterval: 1000
    }
  )

  const kill = async (pid: number) => {
    try {
      const resp = await fetch(`/api/process?id=${pid}`, { method: 'DELETE' })
      if (!resp.ok) {
        const { error }: { error: string } = await resp.json()
        throw new Error(`${error}`)
      }
    } catch (err) {
      toast({
        title: 'Error!',
        description: `Failed to kill process: ${err}`,
        variant: 'destructive'
      })
    }
  }

  return (
    <>
      {isLoading ? (
        <Loader2 className='animate-spin h-8 w-8' />
      ) : error ? null : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className='text-right'>Mem (MB)</TableHead>
              <TableHead className='text-right'>Status</TableHead>
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data
              ?.sort((a, b) => a.id - b.id)
              .map(({ id, name, memory, responding }) => (
                <TableRow key={id}>
                  <TableCell className='font-medium'>{id}</TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell className='text-right'>
                    {(memory / 1024 / 1024).toFixed(2)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {responding ? 'Running' : 'Not Responding'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='destructive' size='icon'>
                          <X className='h-4 w-4' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will kill {name}
                            (pid: {id}).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => kill(id)}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          >
                            Kill
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
    </>
  )
}
