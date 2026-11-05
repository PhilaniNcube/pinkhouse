'use client'

import type { ReactNode } from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import type { BookingType } from '@/lib/pricing'

interface StartBookingButtonProps {
  bookingType: BookingType
  specialId?: number | null
  children: ReactNode
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
}

export function StartBookingButton({
  bookingType,
  specialId,
  children,
  variant = 'primary',
  size = 'default',
  className,
}: StartBookingButtonProps) {
  function startBooking() {
    window.dispatchEvent(
      new CustomEvent('pinkhouse:book', {
        detail: {
          bookingType,
          specialId: specialId ?? null,
        },
      }),
    )
    document.getElementById('booking')?.scrollIntoView({ block: 'start' })
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={startBooking}
    >
      {children}
    </Button>
  )
}
