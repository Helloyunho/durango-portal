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
    value: z.string()
  })
  .refine(
    ({ kind, value }) =>
      kind === RegistryKind.BINARY && value.match(base64Regex),
    {
      message: 'Binary value must be base64 encoded.',
      path: ['value']
    }
  )
  .refine(
    ({ kind, value }) =>
      (kind === RegistryKind.DWORD || kind === RegistryKind.QWORD) &&
      !isNaN(Number(value)),
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
      const resp = await fetch(`/api/registry/value?key=${encodedTrace}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: value.key,
          kind: data.kind,
          value: data.value
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    onValueChange={field.onChange}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Please select the kind of value.' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(RegistryKind).map((kind) => (
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
                  registryEditForm.formState.isSubmitting
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
