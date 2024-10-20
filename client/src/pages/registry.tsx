import React from 'react'
import { RegistrySidebar } from '@/components/registry-sidebar'

export const RegistryManager = () => {
  const [selected, setSelected] = React.useState<string[]>([''])
  const onClick = (trace: string[]) => {
    setSelected(trace)
  }

  return (
    <>
      <RegistrySidebar selected={selected} onClick={onClick} />
    </>
  )
}
