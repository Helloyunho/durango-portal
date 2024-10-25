import { z } from 'zod'

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from '@/components/ui/button'
import {
  kindToString,
  RegistryKind,
  type RegistryValue
} from '@/types/registry'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Edit, Loader2, X } from 'lucide-react'

const base64Regex =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/

const registryEditScheme = z
  .object({
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

export const RegistryEditDialog = ({
  open,
  onOpenChange,
  value
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: RegistryValue & { trace: string[] }
}) => {
  const { toast } = useToast()

  const registryEditForm = useForm<z.infer<typeof registryEditScheme>>({
    resolver: zodResolver(registryEditScheme),
    defaultValues: {
      kind: value.kind,
      value: value.value.toString()
    }
  })

  const editRegistryValue = async (
    data: z.infer<typeof registryEditScheme>
  ) => {
    try {
      const encodedTrace = encodeURIComponent(value.trace.join('\\'))
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
          key: value.key,
          kind: data.kind,
          value: _value
        })
      })
      if (!resp.ok) {
        const { message, stackTrace } = await resp.json()
        throw new Error(`${message}: ${stackTrace}`)
      }
      onOpenChange(false)
    } catch (err) {
      toast({
        title: 'Error!',
        description: `Failed to edit value: ${err}`,
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
          registryEditForm.reset()
        }
        onOpenChange(open)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Registry</DialogTitle>
          <DialogDescription>Edit registry {value.key}</DialogDescription>
        </DialogHeader>
        <Form {...registryEditForm}>
          <form
            onSubmit={registryEditForm.handleSubmit(editRegistryValue)}
            className='space-y-8'
          >
            <FormField
              control={registryEditForm.control}
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
              control={registryEditForm.control}
              name='value'
              render={({ field }) => {
                const kind = registryEditForm.watch('kind')

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
                  !registryEditForm.formState.isValid ||
                  registryEditForm.formState.isSubmitting ||
                  !registryEditForm.formState.isDirty
                }
              >
                {registryEditForm.formState.isSubmitting ? (
                  <Loader2 className='animate-spin h-4 w-4 mr-2' />
                ) : (
                  <Edit className='w-4 h-4 mr-2' />
                )}
                Edit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
