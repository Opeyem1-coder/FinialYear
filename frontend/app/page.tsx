'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const user = sessionStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      // Redirect based on role
      if (userData.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (userData.role === 'registry') {
        router.push('/registry/dashboard')
      } else if (userData.role === 'teacher') {
        router.push('/teacher/dashboard')
      } else if (userData.role === 'parent') {
        router.push('/parent/dashboard')
      } else if (userData.role === 'student') {
        router.push('/student/dashboard')
      }
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/login')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}
