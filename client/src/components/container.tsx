export const Container = ({ children }: { children?: React.ReactNode }) => (
  <main className='flex items-start flex-col px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 lg:py-8 gap-6 lg:gap-8'>
    {children}
  </main>
)
