'use client'

import { ReactNode } from 'react'

interface FormWrapperProps {
  title: string
  subtitle?: string
  children: ReactNode
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function FormWrapper({
  title,
  subtitle,
  children,
  onSubmit,
}: FormWrapperProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </form>
  )
}
