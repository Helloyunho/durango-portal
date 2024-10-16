import { useSWRFetcher } from '@/lib/swr-fetcher'
import { Loader2 } from 'lucide-react'
import type { Package } from '@/types/package'
import { PackageInstallButton } from '@/components/pkg-install-button'
import { DataTable } from '@/components/data-table'
import { packageColumns } from '@/components/package-columns'

export const PackageManagement = () => {
  const { isLoading, data, error } = useSWRFetcher<Package[]>(
    '/api/app',
    undefined,
    {
      refreshInterval: 10000
    }
  )

  return (
    <>
      {isLoading ? (
        <Loader2 className='animate-spin h-8 w-8' />
      ) : error ? null : (
        <>
          <div className='flex justify-between w-full'>
            <h2 className='text-3xl font-semibold'>Package Management</h2>
            <PackageInstallButton />
          </div>
          <DataTable
            columns={packageColumns}
            data={data!}
            filterPlaceholder='Search packages... (ID, Name, Publisher)'
            filterFn={(row, _, filterValue) =>
              (row.getValue('id') as string)
                .toLowerCase()
                .includes(filterValue.toLowerCase()) ||
              (row.getValue('name') as string)
                .toLowerCase()
                .includes(filterValue.toLowerCase()) ||
              (row.getValue('publisher') as string)
                .toLowerCase()
                .includes(filterValue.toLowerCase())
            }
          />
          {/* <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[100px]'>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className='text-right'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data
                ?.sort((a, b) => {
                  if (a.name < b.name) return -1
                  if (a.name > b.name) return 1
                  return 0
                })
                .map(({ id, name }) => (
                  <TableRow key={id}>
                    <TableCell className='font-medium'>{id}</TableCell>
                    <TableCell>{name}</TableCell>
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
                              This action cannot be undone. This will remove
                              package {id}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              <X className='w-4 h-4 mr-2' />
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeApp(id)}
                              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            >
                              <Trash className='w-4 h-4 mr-2' />
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table> */}
        </>
      )}
    </>
  )
}
