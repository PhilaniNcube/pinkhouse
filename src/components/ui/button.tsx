import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva('ph-button', {
  variants: {
    variant: {
      primary: 'ph-button--primary',
      outline: 'ph-button--outline',
      ghost: 'ph-button--ghost',
      cream: 'ph-button--cream',
      link: 'ph-button--link',
    },
    size: {
      default: 'ph-button--default',
      small: 'ph-button--small',
      large: 'ph-button--large',
      icon: 'ph-button--icon',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
