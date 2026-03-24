'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'
import { PillButton } from '@/components/ui/pill-button'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

interface SidebarNavProps {
  items: NavItem[]
  userRole: string
  userName: string
  onLogout: () => void
  logo?: React.ReactNode
}

export function SidebarNav({
  items,
  userRole,
  userName,
  onLogout,
  logo,
}: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Logo/Header */}
      <div className="p-6 border-b border-sidebar-border">
        {logo ? (
          logo
        ) : (
          <h2 className="font-heading font-bold text-xl text-sidebar-foreground">
            Portal
          </h2>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-auto p-4 space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between w-full px-4 py-3 rounded-full transition-smooth text-sm font-medium block',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info and logout */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="px-4">
          <p className="text-xs text-sidebar-foreground/60 uppercase font-semibold">
            {userRole}
          </p>
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {userName}
          </p>
        </div>
        <PillButton
          fullWidth
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="border-sidebar-primary text-sidebar-primary"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </PillButton>
      </div>
    </div>
  )
}
