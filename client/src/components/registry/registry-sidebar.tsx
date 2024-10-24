import React from 'react'
import { ChevronRight, RotateCw } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub
} from '@/components/ui/sidebar'
import type { Registry } from '@/types/registry'
import { useToast } from '@/hooks/use-toast'
import type { ErrorContainer } from '@/types/error'

const isArrayEqual = (a: string[], b: string[]) => {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

export const RegistrySidebar = ({
  selected,
  onClick
}: {
  selected: string[]
  onClick: (trace: string[]) => void
}) => {
  const [data, setData] = React.useState<Registry>({
    HKEY_CLASSES_ROOT: null,
    HKEY_CURRENT_USER: null,
    HKEY_LOCAL_MACHINE: null,
    HKEY_USERS: null,
    HKEY_CURRENT_CONFIG: null
  })
  const { toast } = useToast()

  const onLoadClick = async (trace: string[]) => {
    try {
      const query = trace.join('\\')
      const encodedQuery = encodeURIComponent(query)

      const resp = await fetch(`/api/registry/key?key=${encodedQuery}`)
      if (!resp.ok) {
        const { message, stackTrace }: ErrorContainer = await resp.json()
        throw new Error(`${message}: ${stackTrace}`)
      }

      const keys: string[] = await resp.json()
      const _data = { ...data }
      const newData = trace.reduce((acc, key) => {
        if (!acc[key]) {
          acc[key] = {}
        }
        return acc[key]!
      }, _data)

      keys.forEach((item) => {
        newData[item] = null
      })

      setData(_data)
    } catch (err) {
      toast({
        title: 'Error!',
        description: `Failed to load subkeys: ${err}`,
        variant: 'destructive'
      })
      throw err
    }
  }

  return (
    <Sidebar className='relative' collapsible='none'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Keys</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.keys(data).map((key, index) => (
                <Tree
                  key={index}
                  item={data[key]}
                  selected={selected}
                  trace={[key]}
                  onClick={onClick}
                  onLoadClick={onLoadClick}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

const Tree = ({
  item,
  selected,
  trace,
  onClick,
  onLoadClick
}: {
  item: Registry | null
  selected: string[]
  trace: string[]
  onClick: (trace: string[]) => void
  onLoadClick: (trace: string[]) => void
}) => {
  const name = trace[trace.length - 1]

  if (!item) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isArrayEqual(selected, trace)}
          onClick={() => onClick(trace)}
        >
          {name}
        </SidebarMenuButton>
        <SidebarMenuAction onClick={() => onLoadClick(trace)}>
          <RotateCw />
          <span className='sr-only'>Load sub keys</span>
        </SidebarMenuAction>
      </SidebarMenuItem>
    )
  }

  if (!Object.keys(item).length) {
    return (
      <SidebarMenuButton
        isActive={isArrayEqual(selected, trace)}
        onClick={() => onClick(trace)}
      >
        {name}
      </SidebarMenuButton>
    )
  }

  return (
    <SidebarMenuItem>
      <Collapsible className='group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90'>
        <SidebarMenuButton
          isActive={isArrayEqual(selected, trace)}
          onClick={() => onClick(trace)}
        >
          {name}
        </SidebarMenuButton>
        <CollapsibleTrigger asChild>
          <SidebarMenuAction className='data-[state=open]:rotate-90'>
            <ChevronRight />
            <span className='sr-only'>Toggle</span>
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {Object.keys(item).map((subItem, index) => (
              <Tree
                key={index}
                item={item[subItem]}
                selected={selected}
                trace={[...trace, subItem]}
                onClick={onClick}
                onLoadClick={onLoadClick}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}
