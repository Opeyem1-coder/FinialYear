'use client'

import { useState, useEffect } from 'react'
import { Search, Download, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface GradeRow {
    _id: string
    studentName: string
    studentId: string
    courseName: string
    assignmentName: string
    score: number
    totalPoints: number
    date: string
}

export default function AdminGradesPage() {
    const [grades, setGrades] = useState<GradeRow[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourse, setSelectedCourse] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [gradesRes, coursesRes] = await Promise.all([
                apiFetch('/grades'),
                apiFetch('/courses')
            ])

            if (gradesRes.isMock) {
                setGrades([
                    { _id: '1', studentName: 'Emma Smith', studentId: 'STU2024001', courseName: 'CSC 301', assignmentName: 'Mid-term Exam', score: 92, totalPoints: 100, date: '2024-03-15' },
                    { _id: '2', studentName: 'Liam Johnson', studentId: 'STU2024002', courseName: 'MTH 201', assignmentName: 'Quiz 1', score: 78, totalPoints: 100, date: '2024-03-10' },
                    { _id: '3', studentName: 'Olivia Brown', studentId: 'STU2024003', courseName: 'CSC 305', assignmentName: 'Project', score: 85, totalPoints: 100, date: '2024-03-08' },
                    { _id: '4', studentName: 'Noah Wilson', studentId: 'STU2024004', courseName: 'CSC 301', assignmentName: 'Final Exam', score: 65, totalPoints: 100, date: '2024-03-20' },
                ])
                setCourses([{ _id: 'all', courseName: 'All Courses' }, { _id: 'csc301', courseName: 'CSC 301' }, { _id: 'mth201', courseName: 'MTH 201' }])
            } else {
                const rawGrades = gradesRes.data?.data || []
                setGrades(rawGrades.map((g: any) => ({
                    _id: g._id,
                    studentName: g.studentId ? `${g.studentId.firstName} ${g.studentId.lastName}` : 'Unknown',
                    studentId: g.studentId?.studentId || '—',
                    courseName: g.courseId?.courseName || '—',
                    assignmentName: g.assignmentName,
                    score: g.score,
                    totalPoints: g.totalPoints,
                    date: new Date(g.createdAt).toLocaleDateString()
                })))
                setCourses(coursesRes.data?.data || [])
            }
        } catch { toast.error('Failed to load grades') }
        finally { setIsLoading(false) }
    }

    const filtered = grades.filter(g => {
        const matchesCourse = selectedCourse === 'all' || g.courseName === courses.find(c => c._id === selectedCourse)?.courseName
        const matchesSearch = g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.assignmentName.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCourse && matchesSearch
    })

    const avg = filtered.length > 0
        ? (filtered.reduce((acc, g) => acc + (g.score / g.totalPoints * 100), 0) / filtered.length).toFixed(1)
        : '—'
    const passing = filtered.filter(g => (g.score / g.totalPoints * 100) >= 50).length
    const failing = filtered.filter(g => (g.score / g.totalPoints * 100) < 50).length

    const getGradeBadge = (score: number, total: number) => {
        const pct = (score / total) * 100
        if (pct >= 90) return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">A</Badge>
        if (pct >= 80) return <Badge className="bg-blue-100 text-blue-700 border-blue-200">B</Badge>
        if (pct >= 70) return <Badge className="bg-amber-100 text-amber-700 border-amber-200">C</Badge>
        if (pct >= 60) return <Badge className="bg-orange-100 text-orange-700 border-orange-200">D</Badge>
        return <Badge variant="destructive">F</Badge>
    }

    const exportCSV = () => {
        const rows = [
            ['Student Name', 'Student ID', 'Course', 'Assessment', 'Score', 'Total', 'Percentage', 'Date'],
            ...filtered.map(g => [g.studentName, g.studentId, g.courseName, g.assignmentName, g.score, g.totalPoints, `${(g.score / g.totalPoints * 100).toFixed(1)}%`, g.date])
        ]
        const csv = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'grades_report.csv'; a.click()
        URL.revokeObjectURL(url)
        toast.success('Grades exported as CSV')
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Grades Overview</h1>
                    <p className="text-muted-foreground">System-wide academic performance across all courses</p>
                </div>
                <PillButton onClick={exportCSV}><Download className="h-5 w-5 mr-2" />Export CSV</PillButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card><CardHeader className="pb-3"><CardDescription>Total Records</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">{filtered.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Average Score</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{avg}{avg !== '—' ? '%' : ''}</div></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Passing</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-emerald-500">{passing}</div><p className="text-xs text-muted-foreground mt-1">{filtered.length ? Math.round(passing / filtered.length * 100) : 0}% of students</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Failing</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-destructive">{failing}</div><p className="text-xs text-muted-foreground mt-1">{filtered.length ? Math.round(failing / filtered.length * 100) : 0}% of students</p></CardContent></Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                            <Input placeholder="Search by student, course, or assessment..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                        </div>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="Filter by course" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map(c => <SelectItem key={c._id} value={c._id}>{c.courseName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader><CardTitle>All Grade Records</CardTitle><CardDescription>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</CardDescription></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow><TableHead>Student</TableHead><TableHead>Course</TableHead><TableHead>Assessment</TableHead><TableHead>Score</TableHead><TableHead>Grade</TableHead><TableHead>Date</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading grades...</TableCell></TableRow>
                                ) : filtered.length > 0 ? filtered.map(g => (
                                    <TableRow key={g._id}>
                                        <TableCell>
                                            <div className="font-medium">{g.studentName}</div>
                                            <div className="text-xs text-muted-foreground">{g.studentId}</div>
                                        </TableCell>
                                        <TableCell>{g.courseName}</TableCell>
                                        <TableCell>{g.assignmentName}</TableCell>
                                        <TableCell>
                                            <div className="font-semibold">{g.score}/{g.totalPoints}</div>
                                            <div className="text-xs text-muted-foreground">{(g.score / g.totalPoints * 100).toFixed(1)}%</div>
                                        </TableCell>
                                        <TableCell>{getGradeBadge(g.score, g.totalPoints)}</TableCell>
                                        <TableCell>{g.date}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No grade records found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
