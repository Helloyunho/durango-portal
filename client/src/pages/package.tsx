import { useSWRFetcher } from '@/lib/swr-fetcher'
import { Loader2 } from 'lucide-react'
import { PackageInstallButton } from '@/components/pkg-install-button'
import { DataTable } from '@/components/data-table'
import { packageColumns } from '@/components/package-columns'
import type { Package } from '@/types/package'
import type { License } from '@/types/license'

export const PackageManagement = () => {
  const {
    isLoading: appIsLoading,
    data: appData,
    error: appError
  } = useSWRFetcher<Package[]>('/api/app', undefined, {
    refreshInterval: 10000
  })
  const {
    isLoading: licenseIsLoading,
    data: licenseData,
    error: licenseError
  } = useSWRFetcher<License[]>('/api/license', undefined, {
    refreshInterval: 10000
  })

  return (
    <>
      {appIsLoading || licenseIsLoading ? (
        <Loader2 className='animate-spin h-8 w-8' />
      ) : appError || licenseError ? null : (
        <DataTable
          columns={packageColumns}
          data={
            appData?.map((app) => {
              const license = licenseData?.find(
                (license) => license.packageID === app.id
              )
              return {
                ...app,
                licenseID: license?.licenseID
              }
            }) ?? []
          }
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
        >
          <PackageInstallButton />
        </DataTable>
      )}
    </>
  )
}
