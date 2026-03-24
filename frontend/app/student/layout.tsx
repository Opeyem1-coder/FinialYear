'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, BookOpen, BarChart3, MessageSquare, Calendar, Settings } from 'lucide-react'
import { SidebarLayout } from '@/components/layouts/sidebar-layout'
import { SidebarNav } from '@/components/layouts/sidebar-nav'
import { ReactNode } from 'react'

export default function StudentLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const [userName, setUserName] = useState('Student')

    useEffect(() => {
        const uStr = sessionStorage.getItem('user')
        if (uStr) {
            const u = JSON.parse(uStr)
            setUserName(u.firstName ? `${u.firstName} ${u.lastName}` : u.name || u.username || 'Student')
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
            href: '/student/dashboard',
            icon: <Home size={20} />,
        },
        {
            label: 'My Courses',
            href: '/student/courses',
            icon: <BookOpen size={20} />,
        },
        {
            label: 'Grades',
            href: '/student/grades',
            icon: <BarChart3 size={20} />,
        },
        {
            label: 'Attendance',
            href: '/student/attendance',
            icon: <Calendar size={20} />,
        },
        {
            label: 'Messages',
            href: '/student/messages',
            icon: <MessageSquare size={20} />,
        },
        {
            label: 'Settings',
            href: '/student/settings',
            icon: <Settings size={20} />,
        },
    ]

    return (
        <SidebarLayout
            sidebar={
                <SidebarNav
                    items={navItems}
                    userRole="Student"
                    userName={userName}
                    onLogout={handleLogout}
                />
            }
        >
            {children}
        </SidebarLayout>
    )
}
