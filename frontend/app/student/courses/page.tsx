'use client'

import { BookOpen, User, Clock, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PillButton } from '@/components/ui/pill-button'

interface Course {
    id: string
    code: string
    title: string
    units: number
    lecturer: string
    schedule: string
    location: string
    status: 'active' | 'completed'
}

const enrolledCourses: Course[] = [
    { id: '1', code: 'CSC 301', title: 'Data Structures and Algorithms', units: 3, lecturer: 'Prof. John Smith', schedule: 'Mon 10:00 AM - 12:00 PM', location: 'Hall A', status: 'active' },
    { id: '2', code: 'CSC 305', title: 'Operating Systems', units: 3, lecturer: 'Dr. Emily Davis', schedule: 'Tue 1:00 PM - 3:00 PM', location: 'Lab 2', status: 'active' },
    { id: '3', code: 'MTH 201', title: 'Linear Algebra', units: 4, lecturer: 'Prof. James Wilson', schedule: 'Wed 8:00 AM - 10:00 AM', location: 'Hall B', status: 'active' },
    { id: '4', code: 'PHY 203', title: 'General Physics III', units: 3, lecturer: 'Dr. Sarah Johnson', schedule: 'Thu 11:00 AM - 1:00 PM', location: 'Physics Lab', status: 'active' },
    { id: '5', code: 'GST 201', title: 'Communication Skills', units: 2, lecturer: 'Mr. Robert Brown', schedule: 'Fri 9:00 AM - 11:00 AM', location: 'Hall C', status: 'active' },
]

export default function StudentCoursesPage() {
    const totalUnits = enrolledCourses.reduce((acc, course) => acc + course.units, 0)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
                    My Courses
                </h1>
                <p className="text-muted-foreground">
                    View and manage your enrolled courses for the current semester
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle>Current Registration</CardTitle>
                        <CardDescription>2023/2024 Academic Session - 2nd Semester</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-800">
                                <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
                                <p className="text-3xl font-bold text-emerald-500 mt-1">{enrolledCourses.length}</p>
                            </div>
                            <div className="flex-1 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <p className="text-sm font-medium text-muted-foreground">Total Units</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{totalUnits}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Course List */}
            <h2 className="text-2xl font-heading font-bold text-foreground">Registered Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3 border-b border-border">
                            <div className="flex items-start justify-between">
                                <div>
                                    <Badge variant="outline" className="mb-2">{course.code}</Badge>
                                    <CardTitle className="text-xl">{course.title}</CardTitle>
                                </div>
                                <Badge variant={course.status === 'active' ? 'success' : 'secondary'}>
                                    {course.units} Units
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-foreground">
                                    <User className="h-4 w-4 mr-3 text-muted-foreground" />
                                    <span>{course.lecturer}</span>
                                </div>
                                <div className="flex items-center text-sm text-foreground">
                                    <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                                    <span>{course.schedule}</span>
                                </div>
                                <div className="flex items-center text-sm text-foreground">
                                    <BookOpen className="h-4 w-4 mr-3 text-muted-foreground" />
                                    <span>{course.location}</span>
                                </div>
                            </div>
                            <div className="pt-2 flex gap-2">
                                <PillButton className="flex-1" variant="outline">View Materials</PillButton>
                                <PillButton className="flex-1" variant="secondary">Course Page</PillButton>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
