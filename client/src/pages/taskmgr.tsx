import { Loader2 } from 'lucide-react'
import { useSWRFetcher } from '@/lib/swr-fetcher'
import type { Process } from '@/types/process'
import { DataTable } from '@/components/data-table'
import { taskMgrColumns } from '@/components/taskmgr-columns'

export const TaskMgr = () => {
  const { isLoading, data, error } = useSWRFetcher<Process[]>(
    '/api/process',
    undefined,
    {
      refreshInterval: 1000
    }
  )

  return (
    <>
      {isLoading ? (
        <Loader2 className='animate-spin h-8 w-8' />
      ) : error ? null : (
        <>
          <h2 className='text-3xl font-semibold'>Task Manager</h2>
          <DataTable
            columns={taskMgrColumns}
            data={data!}
            filterPlaceholder='Search processes... (ID, Name)'
            filterFn={(row, _, filterValue) =>
              (row.getValue('id') as number)
                .toString()
                .includes(filterValue.toLowerCase()) ||
              (row.getValue('name') as string)
                .toLowerCase()
                .includes(filterValue.toLowerCase())
            }
          />
        </>
      )}
    </>
  )
}
