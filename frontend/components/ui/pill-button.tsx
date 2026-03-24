import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const pillButtonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-smooth focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground active:bg-primary/90',
        ghost: 'text-foreground hover:bg-muted active:bg-muted/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        success: 'bg-emerald-500 text-white hover:bg-emerald-500 active:bg-emerald-500',
      },
      size: {
        sm: 'px-4 py-2 text-xs h-8',
        md: 'px-6 py-2 text-sm h-10',
        lg: 'px-8 py-3 text-base h-12',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface PillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pillButtonVariants> {}

const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => (
    <button
      className={cn(pillButtonVariants({ variant, size, fullWidth }), className)}
      ref={ref}
      {...props}
    />
  )
)
PillButton.displayName = 'PillButton'

export { PillButton, pillButtonVariants }
