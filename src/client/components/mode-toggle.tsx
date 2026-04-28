import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

function useResolvedTheme() {
  const { theme } = useTheme()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (theme === 'dark') {
      setIsDark(true)
      return
    }
    if (theme === 'light') {
      setIsDark(false)
      return
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return isDark
}

export function ModeToggle() {
  const { setTheme } = useTheme()
  const isDark = useResolvedTheme()

  return (
    <Button
      variant="outline"
      size="icon-sm"
      className="relative rounded-full"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Moon className="rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
      <Sun className="absolute -rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
