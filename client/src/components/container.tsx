import { cn } from '@/lib/utils'

export const Container = ({
  children,
  className
}: {
  children?: React.ReactNode
  className?: string
}) => (
  <main
    className={cn(
      'flex items-start flex-col px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 lg:py-8 gap-6 lg:gap-8 h-full',
      className
    )}
  >
    {children}
  </main>
)
