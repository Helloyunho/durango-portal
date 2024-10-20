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
  SidebarMenuSub,
  SidebarProvider
} from '@/components/ui/sidebar'
import type { Registry } from '@/types/registry'
import { useToast } from '@/hooks/use-toast'
import type { ErrorContainer } from '@/types/error'

export const RegistrySidebar = ({
  selected,
  onClick
}: {
  selected: string[]
  onClick: (trace: string[]) => void
}) => {
  const [data, setData] = React.useState<Registry>({
    keys: {
      HKEY_CLASSES_ROOT: {
        keys: null,
        values: []
      },
      HKEY_CURRENT_USER: {
        keys: null,
        values: []
      },
      HKEY_LOCAL_MACHINE: {
        keys: null,
        values: []
      },
      HKEY_USERS: {
        keys: null,
        values: []
      },
      HKEY_CURRENT_CONFIG: {
        keys: null,
        values: []
      }
    },
    values: []
  })
  const { toast } = useToast()

  const onLoadClick = async (trace: string[]) => {
    try {
      const query = trace.join('\\')
      const encodedQuery = encodeURIComponent(query)

      const resp = await fetch(`/api/registry/subkey?key=${encodedQuery}`)
      if (!resp.ok) {
        const { message, stackTrace }: ErrorContainer = await resp.json()
        throw new Error(`${message}: ${stackTrace}`)
      }

      const data: string[] = await resp.json()
      setData((prev) => {
        const newData = trace.reduce((acc, key, index) => {
          if (index === trace.length - 1) {
            const keys: Registry = acc.keys![key]
            data.forEach((item) => {
              keys.keys![item] = {
                keys: null,
                values: []
              }
            })
            acc.keys![key] = keys
          }

          return acc.keys![key]
        }, prev)

        return { ...prev, ...newData }
      })
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
    <SidebarProvider>
      <Sidebar className='relative' collapsible='none'>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Keys</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Object.keys(data.keys!).map((key, index) => (
                  <Tree
                    key={index}
                    item={data.keys![key]}
                    selected={selected}
                    trace={[key]}
                    onClick={onClick}
                    onLoadClick={() => onLoadClick([key])}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

const Tree = ({
  item,
  selected,
  trace,
  onClick,
  onLoadClick
}: {
  item: Registry
  selected: string[]
  trace: string[]
  onClick: (trace: string[]) => void
  onLoadClick: (trace: string[]) => void
}) => {
  const { keys } = item
  const name = trace[trace.length - 1]

  if (!keys) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={selected.every((key, index) => key === trace[index])}
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

  if (!keys.length) {
    return (
      <SidebarMenuButton
        isActive={selected.every((key, index) => key === trace[index])}
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
          isActive={selected.every((key, index) => key === trace[index])}
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
            {Object.keys(keys).map((subItem, index) => (
              <Tree
                key={index}
                item={keys[subItem]}
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
