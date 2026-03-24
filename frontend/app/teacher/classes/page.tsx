'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { BookOpen, Users, Calendar, BarChart2, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'

interface Class { id: string; name: string; subject: string; teacher: string; color: string }

export default function TeacherClassesPage() {
    const router = useRouter()
    const [classes, setClasses] = useState<Class[]>([])

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const res = await apiFetch('/courses')
                if (res.isMock) {
                    setClasses([
                        { id: 'math', name: 'CSC 301 — Data Structures', subject: 'Computer Science', teacher: 'Dr. Smith', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
                        { id: 'science', name: 'CSC 305 — Operating Systems', subject: 'Computer Science', teacher: 'Dr. Smith', color: 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500 dark:text-emerald-400' },
                        { id: 'english', name: 'MTH 201 — Linear Algebra', subject: 'Mathematics', teacher: 'Dr. Smith', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
                    ])
                } else {
                    const colors = ['bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500 dark:text-emerald-400', 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400']
                    setClasses(res.data.data.map((c: any, idx: number) => ({
                        id: c._id, name: c.courseName, subject: c.subject,
                        teacher: c.teacherId ? `${c.teacherId.firstName} ${c.teacherId.lastName}` : 'Unassigned',
                        color: colors[idx % colors.length]
                    })))
                }
            } catch (err) { console.error('Failed to load classes', err) }
        }
        loadCourses()
    }, [])

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
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="p-2 rounded bg-muted/50"><p className="text-xs text-muted-foreground">Avg Grade</p><p className="text-lg font-bold text-foreground">—</p></div>
                                <div className="p-2 rounded bg-muted/50"><p className="text-xs text-muted-foreground">Attendance</p><p className="text-lg font-bold text-foreground">—</p></div>
                            </div>
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
                    <div className="col-span-3 text-center py-16 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No classes assigned yet</p>
                        <p className="text-sm mt-1">Ask an admin to create and assign courses to you.</p>
                    </div>
                )}
            </div>

            <Card>
                <CardHeader><CardTitle>Summary</CardTitle><CardDescription>Your teaching load at a glance</CardDescription></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border border-border text-center"><p className="text-3xl font-bold text-primary mb-1">{classes.length}</p><p className="text-sm text-muted-foreground">Courses Teaching</p></div>
                        <div className="p-4 rounded-lg border border-border text-center"><p className="text-3xl font-bold text-secondary mb-1">—</p><p className="text-sm text-muted-foreground">Total Students</p></div>
                        <div className="p-4 rounded-lg border border-border text-center"><p className="text-3xl font-bold text-emerald-500 mb-1">—</p><p className="text-sm text-muted-foreground">Pending Grades</p></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
