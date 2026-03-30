'use client'

import { useState, useEffect } from 'react'
import { BookOpen, User, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/lib/api'

export default function StudentCoursesPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                const uStr = sessionStorage.getItem('user')
                if (!uStr) { setIsLoading(false); return }
                const user = JSON.parse(uStr)

                const studentRes = await apiFetch(`/students?userId=${user._id || user.id}`)
                const profile = studentRes.data?.data?.[0]
                if (!profile) { setIsLoading(false); return }

                const coursesData = profile.courseIds || []
                if (coursesData.length === 0) {
                    const allCoursesRes = await apiFetch('/courses')
                    setCourses(allCoursesRes.data?.data || [])
                } else {
                    setCourses(coursesData)
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load courses')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const colors = [
        'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800',
        'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
        'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    ]

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading courses...</div>
    if (error) return <div className="p-8 text-center text-destructive">{error}</div>

    const totalUnits = courses.reduce((acc: number, c: any) => {
        const match = (c.subject || '').match(/(\d+)/)
        return acc + (match ? parseInt(match[1]) : 3)
    }, 0)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">My Courses</h1>
                <p className="text-muted-foreground">View your enrolled courses for the current semester</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle>Current Registration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-800">
                                <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
                                <p className="text-3xl font-bold text-emerald-500 mt-1">{courses.length}</p>
                            </div>
                            <div className="flex-1 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <p className="text-sm font-medium text-muted-foreground">Total Units</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{totalUnits}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No courses enrolled yet</p>
                    <p className="text-sm mt-1">Contact the Registry office to enrol in courses.</p>
                </div>
            ) : (
                <>
                    <h2 className="text-2xl font-heading font-bold text-foreground">Registered Courses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.map((course: any, idx: number) => {
                            const parts = (course.courseName || '').split('—')
                            const code = parts[0]?.trim() || course.courseName
                            const title = parts[1]?.trim() || course.subject || course.courseName
                            const units = (course.subject || '').match(/(\d+)/)?.[1] || '3'
                            const teacher = course.teacherId
                                ? `${course.teacherId.firstName} ${course.teacherId.lastName}`
                                : 'Assigned by Registry'
                            return (
                                <Card key={course._id || idx} className={`hover:shadow-md transition-shadow border-2 ${colors[idx % colors.length]}`}>
                                    <CardHeader className="pb-3 border-b border-border">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <Badge variant="outline" className="mb-2">{code}</Badge>
                                                <CardTitle className="text-lg leading-snug">{title}</CardTitle>
                                            </div>
                                            <Badge variant="secondary">{units} Units</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-2">
                                        <div className="flex items-center text-sm text-foreground">
                                            <User className="h-4 w-4 mr-3 text-muted-foreground" />
                                            <span>{teacher}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-foreground">
                                            <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                                            <span>{course.schedule || 'Schedule TBD'}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-foreground">
                                            <BookOpen className="h-4 w-4 mr-3 text-muted-foreground" />
                                            <span>{course.location || 'Location TBD'}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}
