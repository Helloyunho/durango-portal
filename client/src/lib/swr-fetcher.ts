import useSWR from 'swr'
import { useToast } from '@/hooks/use-toast'

export const useSWRFetcher = <T>(
  url: string,
  options?: RequestInit,
  swrOptions?: { refreshInterval?: number }
) => {
  const { toast } = useToast()

  return useSWR<T>(
    url,
    async (): Promise<Awaited<T>> => {
      const res = await fetch(url, options)
      if (!res.ok) {
        console.error('Failed to fetch data:', res.status, res.statusText)
        toast({
          title: 'Error!',
          description: 'Failed to request data',
          variant: 'destructive'
        })
        throw new Error('Failed to fetch data')
      }
      return (await res.json()) as Awaited<T>
    },
    swrOptions
  )
}
