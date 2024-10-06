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
import { Loader2, Trash } from 'lucide-react'

export const AppManagement = () => {
  const { toast } = useToast()
  const { isLoading, data, error } = useSWRFetcher<string[]>(
    '/api/app',
    undefined,
    {
      refreshInterval: 10000
    }
  )

  const removeApp = async (id: string) => {
    try {
      const resp = await fetch(`/api/app?id=${id}`, { method: 'DELETE' })
      if (!resp.ok) {
        const { error }: { error: string } = await resp.json()
        throw new Error(`${error}`)
      }
    } catch (err) {
      toast({
        title: 'Error!',
        description: `Failed to remove app: ${err}`,
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
              <TableHead className='text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.sort().map((id) => (
              <TableRow key={id}>
                <TableCell className='font-medium'>{id}</TableCell>
                <TableCell className='text-right'>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='destructive' size='icon'>
                        <Trash className='h-4 w-4' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will remove app{' '}
                          {id}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeApp(id)}
                          className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        >
                          Remove
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
