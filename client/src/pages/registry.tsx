import React from 'react'
import { Loader2 } from 'lucide-react'

import { SidebarProvider } from '@/components/ui/sidebar'
import type { RegistryValue } from '@/types/registry'
import { useSWRFetcher } from '@/lib/swr-fetcher'
import { DataTable } from '@/components/data-table'
import { RegistrySidebar } from '@/components/registry/registry-sidebar'
import { registryColumns } from '@/components/registry/registry-columns'
import { RegistryAddValueButton } from '@/components/registry/registry-add-value-button'

export const RegistryManager = () => {
  const [selected, setSelected] = React.useState<string[]>([])
  const onClick = (trace: string[]) => {
    setSelected(trace)
  }

  return (
    <SidebarProvider>
      <RegistrySidebar selected={selected} onClick={onClick} />
      <main className='pl-4 w-full'>
        {selected.length > 0 ? <RegistryManagerBody trace={selected} /> : null}
      </main>
    </SidebarProvider>
  )
}

export const RegistryManagerBody = ({ trace }: { trace: string[] }) => {
  const { isLoading, data, error } = useSWRFetcher<RegistryValue[]>(
    `/api/registry/value?key=${encodeURIComponent(trace.join('\\'))}`,
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
        <DataTable
          columns={registryColumns}
          data={data?.map((value) => ({ ...value, trace })) ?? []}
          filterPlaceholder='Search values... (Key, Value)'
          filterFn={(row, _, filterValue) =>
            (row.getValue('key') as string).includes(
              filterValue.toLowerCase()
            ) ||
            row.original.value
              .toString()
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          }
          defaultSortKey='key'
        >
          <RegistryAddValueButton trace={trace} />
        </DataTable>
      )}
    </>
  )
}
