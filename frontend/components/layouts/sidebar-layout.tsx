'use client'

import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PillButton } from '@/components/ui/pill-button'

interface SidebarLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  className?: string
}

export function SidebarLayout({
  children,
  sidebar,
  className,
}: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-card border-b border-border p-4 flex items-center justify-between">
        <h1 className="font-heading font-bold text-lg text-foreground">Portal</h1>
        <PillButton
          size="icon-sm"
          variant="ghost"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </PillButton>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed md:relative md:flex md:flex-col w-64 h-full bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-30 md:z-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
      >
        {sidebar}
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden h-16" /> {/* Spacer for mobile header */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
