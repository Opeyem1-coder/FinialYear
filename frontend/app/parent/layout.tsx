'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, BookOpen, AlertCircle, MessageSquare, Settings } from 'lucide-react'
import { SidebarLayout } from '@/components/layouts/sidebar-layout'
import { SidebarNav } from '@/components/layouts/sidebar-nav'
import { ReactNode } from 'react'

export default function ParentLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [userName, setUserName] = useState('Parent')

  useEffect(() => {
    const uStr = sessionStorage.getItem('user')
    if (uStr) {
      const u = JSON.parse(uStr)
      setUserName(u.firstName ? `${u.firstName} ${u.lastName}` : u.name || u.username || 'Parent')
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    localStorage.removeItem('authToken')
    router.push('/auth/login')
  }

  const navItems = [
    {
      label: 'Dashboard',
      href: '/parent/dashboard',
      icon: <Home size={20} />,
    },
    {
      label: "Child's Academics",
      href: '/parent/academics',
      icon: <BookOpen size={20} />,
    },
    {
      label: 'Behavior & Discipline',
      href: '/parent/discipline',
      icon: <AlertCircle size={20} />,
    },
    {
      label: 'Messages',
      href: '/parent/messages',
      icon: <MessageSquare size={20} />,
    },
    {
      label: 'Settings',
      href: '/parent/settings',
      icon: <Settings size={20} />,
    },
  ]

  return (
    <SidebarLayout
      sidebar={
        <SidebarNav
          items={navItems}
          userRole="Parent / Guardian"
          userName={userName}
          onLogout={handleLogout}
        />
      }
    >
      {children}
    </SidebarLayout>
  )
}

