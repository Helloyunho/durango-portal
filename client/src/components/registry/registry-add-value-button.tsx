import React from 'react'
import { z } from 'zod'

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { kindToString, RegistryKind } from '@/types/registry'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, X } from 'lucide-react'

const base64Regex =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/

const registryAddValueScheme = z
  .object({
    key: z.string().min(1, 'Key is required.'),
    kind: z.nativeEnum(RegistryKind),
    value: z.string().min(1, 'Value is required.')
  })
  .refine(
    ({ kind, value }) =>
      kind === RegistryKind.BINARY ? value.match(base64Regex) : true,
    {
      message: 'Binary value must be base64 encoded.',
      path: ['value']
    }
  )
  .refine(
    ({ kind, value }) =>
      kind === RegistryKind.DWORD || kind === RegistryKind.QWORD
        ? !isNaN(Number(value))
        : true,
    {
      message: 'DWORD or QWORD value must be a number.',
      path: ['value']
    }
  )

export const RegistryAddValueButton = ({ trace }: { trace: string[] }) => {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()

  const registryAddValueForm = useForm<z.infer<typeof registryAddValueScheme>>({
    resolver: zodResolver(registryAddValueScheme),
    defaultValues: {
      key: '',
      kind: RegistryKind.STRING,
      value: ''
    }
  })

  const addRegistryValue = async (
    data: z.infer<typeof registryAddValueScheme>
  ) => {
    try {
      const encodedTrace = encodeURIComponent(trace.join('\\'))
      let _value: string | number | string[] = data.value
      if (
        data.kind === RegistryKind.DWORD ||
        data.kind === RegistryKind.QWORD
      ) {
        _value = Number(data.value)
      } else if (data.kind === RegistryKind.MULTI_STRING) {
        _value = data.value.split('\n')
      }
      const resp = await fetch(`/api/registry/value?key=${encodedTrace}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: data.key,
          kind: data.kind,
          value: _value
        })
      })
      if (!resp.ok) {
        const { message, stackTrace } = await resp.json()
        throw new Error(`${message}: ${stackTrace}`)
      }
      setOpen(false)
    } catch (err) {
      toast({
        title: 'Error!',
        description: `Failed to add value: ${err}`,
        variant: 'destructive'
      })
      throw err
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          registryAddValueForm.reset()
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button size='icon'>
          <Plus className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Registry Value</DialogTitle>
        </DialogHeader>
        <Form {...registryAddValueForm}>
          <form
            onSubmit={registryAddValueForm.handleSubmit(addRegistryValue)}
            className='space-y-8'
          >
            <FormField
              control={registryAddValueForm.control}
              name='key'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input placeholder='SomeKeyName' {...field} />
                  </FormControl>
                  <FormDescription>Type the key name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registryAddValueForm.control}
              name='kind'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kind</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Please select the kind of value.' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 7, 11].map((kind) => (
                        <SelectItem key={kind} value={kind.toString()}>
                          {kindToString(kind as RegistryKind)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the kind of this value.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registryAddValueForm.control}
              name='value'
              render={({ field }) => {
                const kind = registryAddValueForm.watch('kind')

                return (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    {kind === RegistryKind.BINARY ? (
                      <>
                        <FormControl>
                          <Input placeholder='AAAAAAA=' {...field} />
                        </FormControl>
                        <FormDescription>
                          Type base64 encoded binary value.
                        </FormDescription>
                      </>
                    ) : kind === RegistryKind.DWORD ||
                      kind === RegistryKind.QWORD ? (
                      <>
                        <FormControl>
                          <Input placeholder='0' {...field} />
                        </FormControl>
                        <FormDescription>
                          Type a number for DWORD or QWORD value. (e.g. 0, 0x1,
                          0b10)
                        </FormDescription>
                      </>
                    ) : kind === RegistryKind.MULTI_STRING ? (
                      <>
                        <FormControl>
                          <Textarea
                            placeholder='This is a multi-string value,\nseparated by newlines.'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Type a multi-string value, separated by newlines.
                        </FormDescription>
                      </>
                    ) : (
                      <>
                        <FormControl>
                          <Input
                            placeholder='This is a string value.'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Type the value of the registry.
                        </FormDescription>
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='secondary'>
                  <X className='w-4 h-4 mr-2' />
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type='submit'
                disabled={
                  !registryAddValueForm.formState.isValid ||
                  registryAddValueForm.formState.isSubmitting ||
                  !registryAddValueForm.formState.isDirty
                }
              >
                {registryAddValueForm.formState.isSubmitting ? (
                  <Loader2 className='animate-spin h-4 w-4 mr-2' />
                ) : (
                  <Plus className='w-4 h-4 mr-2' />
                )}
                Add
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
