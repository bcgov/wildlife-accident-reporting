import { Button } from '@/components/ui/button'
import {
  Credenza,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'
import { useAuthStore } from '@/stores/auth-store'

interface LogoutAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoutAlert({ open, onOpenChange }: LogoutAlertProps) {
  const { logout } = useAuthStore()

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Are you sure you want to log out?</CredenzaTitle>
          <CredenzaDescription>
            You will be redirected to the login screen and your current session
            will end.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaFooter>
          <CredenzaClose asChild>
            <Button variant="outline">Cancel</Button>
          </CredenzaClose>
          <Button variant="destructive-filled" onClick={logout}>
            Confirm
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
