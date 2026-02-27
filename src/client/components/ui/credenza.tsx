import { createContext, type ReactNode, use } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

const CredenzaContext = createContext<boolean>(false)

interface BaseProps {
  children: ReactNode
}

interface RootCredenzaProps extends BaseProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface CredenzaProps extends BaseProps {
  className?: string
  asChild?: true
}

function Credenza({ children, open, onOpenChange }: RootCredenzaProps) {
  const isMobile = useIsMobile()
  const Component = isMobile ? Drawer : Dialog

  return (
    <CredenzaContext value={isMobile}>
      <Component open={open} onOpenChange={onOpenChange}>
        {children}
      </Component>
    </CredenzaContext>
  )
}

function CredenzaTrigger({ className, children, ...props }: CredenzaProps) {
  const isMobile = use(CredenzaContext)
  const Component = isMobile ? DrawerTrigger : DialogTrigger

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

function CredenzaClose({ className, children, ...props }: CredenzaProps) {
  const isMobile = use(CredenzaContext)
  const Component = isMobile ? DrawerClose : DialogClose

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

function CredenzaContent({ className, children, ...props }: CredenzaProps) {
  const isMobile = use(CredenzaContext)
  const Component = isMobile ? DrawerContent : DialogContent

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

function CredenzaHeader({ className, children, ...props }: CredenzaProps) {
  const isMobile = use(CredenzaContext)
  const Component = isMobile ? DrawerHeader : DialogHeader

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

function CredenzaTitle({ className, children, ...props }: CredenzaProps) {
  const isMobile = use(CredenzaContext)
  const Component = isMobile ? DrawerTitle : DialogTitle

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

function CredenzaDescription({ className, children, ...props }: CredenzaProps) {
  const isMobile = use(CredenzaContext)
  const Component = isMobile ? DrawerDescription : DialogDescription

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

function CredenzaBody({ className, children }: CredenzaProps) {
  return <div className={cn('px-4 md:px-0', className)}>{children}</div>
}

function CredenzaFooter({ className, children, ...props }: CredenzaProps) {
  const isMobile = use(CredenzaContext)
  const Component = isMobile ? DrawerFooter : DialogFooter

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  )
}

export {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
}
