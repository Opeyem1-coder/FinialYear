'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { BookOpen, Users, BarChart2, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function TeacherClassesPage() {
    const router = useRouter()
    const [classes, setClasses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiFetch('/courses')
                const colors = [
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                    'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500 dark:text-emerald-400',
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                    'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                ]
                setClasses((res.data?.data || []).map((c: any, idx: number) => ({
                    id: c._id, name: c.courseName, subject: c.subject,
                    teacher: c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : 'Unassigned',
                    color: colors[idx % colors.length]
                })))
            } catch (err: any) {
                toast.error('Failed to load classes')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading classes...</div>

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">My Classes</h1>
                <p className="text-muted-foreground">View and manage your assigned courses</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                    <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-full ${cls.color} mb-3`}><BookOpen className="h-6 w-6" /></div>
                                <Badge variant="outline">{cls.subject}</Badge>
                            </div>
                            <CardTitle className="leading-snug">{cls.name}</CardTitle>
                            <CardDescription>{cls.teacher}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <PillButton variant="outline" size="sm" fullWidth onClick={() => router.push(`/teacher/grades?courseId=${cls.id}`)}>
                                    <BarChart2 className="h-4 w-4 mr-1" />Grades
                                </PillButton>
                                <PillButton variant="secondary" size="sm" fullWidth onClick={() => router.push(`/teacher/attendance?courseId=${cls.id}`)}>
                                    <ClipboardList className="h-4 w-4 mr-1" />Attendance
                                </PillButton>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {classes.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-muted-foreground border border-dashed rounded-xl">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No classes assigned yet</p>
                        <p className="text-sm mt-1">Ask an admin to create and assign courses to you.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
