import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

type FormAlertTone = 'success' | 'error' | 'info'

interface FormAlertProps {
  tone: FormAlertTone
  title: string
  description: string
}

const toneStyles = {
  success: {
    container: 'border-green-600/30 bg-green-600/10 dark:border-green-500/30 dark:bg-green-500/10',
    icon: 'text-green-700 dark:text-green-300',
    title: 'text-green-900 dark:text-green-100',
    description: 'text-green-800/90 dark:text-green-200/90',
  },
  error: {
    container: 'border-destructive/30 bg-destructive/10',
    icon: 'text-destructive',
    title: 'text-destructive',
    description: 'text-destructive/90',
  },
  info: {
    container: 'border-blue-600/30 bg-blue-600/10',
    icon: 'text-blue-700 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-300',
    description: 'text-blue-700 dark:text-blue-300',
  },
} as const

const toneIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const

export function FormAlert({ tone, title, description }: FormAlertProps) {
  const styles = toneStyles[tone]
  const Icon = toneIcons[tone]

  return (
    <Alert
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('mt-6 gap-1 p-4', styles.container)}
    >
      <Icon aria-hidden="true" className={cn('mt-0.5 size-4 shrink-0', styles.icon)} />
      <AlertTitle className={cn('text-sm font-medium', styles.title)}>{title}</AlertTitle>
      <AlertDescription className={cn('text-sm', styles.description)}>
        {description}
      </AlertDescription>
    </Alert>
  )
}
