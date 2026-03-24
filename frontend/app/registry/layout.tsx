'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Users, UserPlus, GraduationCap, LayoutDashboard } from 'lucide-react'
import { SidebarLayout } from '@/components/layouts/sidebar-layout'
import { SidebarNav } from '@/components/layouts/sidebar-nav'
import { ReactNode } from 'react'

export default function RegistryLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const [userName, setUserName] = useState('Registry')

    useEffect(() => {
        const uStr = sessionStorage.getItem('user')
        if (uStr) {
            const u = JSON.parse(uStr)
            setUserName(u.firstName ? `${u.firstName} ${u.lastName}` : u.name || u.username || 'Registry')
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
            href: '/registry/dashboard',
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: 'Students',
            href: '/registry/students',
            icon: <GraduationCap size={20} />,
        },
        {
            label: 'Lecturers',
            href: '/registry/lecturers',
            icon: <Users size={20} />,
        },
        {
            label: 'Parents',
            href: '/registry/parents',
            icon: <UserPlus size={20} />,
        },
    ]

    return (
        <SidebarLayout
            sidebar={
                <SidebarNav
                    items={navItems}
                    userRole="Registry"
                    userName={userName}
                    onLogout={handleLogout}
                />
            }
        >
            {children}
        </SidebarLayout>
    )
}
