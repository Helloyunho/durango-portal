import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { Import, X, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { ErrorContainer } from '@/types/error'
import React from 'react'

const packageInstallSchema = z.object({
  package: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, 'Package file is required'),
  cert: z.instanceof(FileList).optional()
  // ,deps: z.array(z.instanceof(File))
})

export const PackageInstallButton = () => {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()

  const packageInstallForm = useForm<z.infer<typeof packageInstallSchema>>({
    resolver: zodResolver(packageInstallSchema)
  })

  const installApp = async (data: z.infer<typeof packageInstallSchema>) => {
    try {
      if (data.cert) {
        const certInstallResp = await fetch('/api/app/cert', {
          method: 'POST',
          body: data.cert.item(0)
        })
        if (!certInstallResp.ok) {
          const { message, stackTrace }: ErrorContainer =
            await certInstallResp.json()
          throw new Error(`${message}: ${stackTrace}`)
        }
      }
      const appInstallResp = await fetch('/api/app', {
        method: 'POST',
        body: data.package.item(0)
      })
      if (!appInstallResp.ok) {
        const { message, stackTrace }: ErrorContainer =
          await appInstallResp.json()
        throw new Error(`${message}: ${stackTrace}`)
      }
      setOpen(false)
    } catch (err) {
      toast({
        title: 'Error!',
        description: `Failed to install package: ${err}`,
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
          packageInstallForm.reset()
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button size='icon'>
          <Import className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install Package</DialogTitle>
          <DialogDescription>
            Install a package with an encrypted package file(.eappx) and
            optional certificate file(.p7x)
          </DialogDescription>
        </DialogHeader>
        <Form {...packageInstallForm}>
          <form
            onSubmit={packageInstallForm.handleSubmit(installApp)}
            className='space-y-8'
          >
            <FormField
              control={packageInstallForm.control}
              name='package'
              render={() => (
                <FormItem>
                  <FormLabel>Package file</FormLabel>
                  <FormControl>
                    <Input
                      type='file'
                      onChange={(e) => {
                        packageInstallForm.setValue(
                          'package',
                          e.target.files!,
                          {
                            shouldValidate: true
                          }
                        )
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The encrypted package file(.eappx)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={packageInstallForm.control}
              name='cert'
              render={() => (
                <FormItem>
                  <FormLabel>Certificate file</FormLabel>
                  <FormControl>
                    <Input
                      type='file'
                      onChange={(e) => {
                        packageInstallForm.setValue('cert', e.target.files!, {
                          shouldValidate: true
                        })
                      }}
                    />
                  </FormControl>
                  <FormDescription>The certificate file(.p7x)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
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
                  !packageInstallForm.formState.isValid ||
                  packageInstallForm.formState.isSubmitting
                }
              >
                {packageInstallForm.formState.isSubmitting ? (
                  <Loader2 className='animate-spin h-4 w-4 mr-2' />
                ) : (
                  <Import className='w-4 h-4 mr-2' />
                )}
                Install
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
