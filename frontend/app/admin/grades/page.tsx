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

interface GradeRow { _id: string; studentName: string; studentId: string; courseName: string; assignmentName: string; score: number; totalPoints: number; date: string }

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
            const [gradesRes, coursesRes] = await Promise.all([apiFetch('/grades'), apiFetch('/courses')])
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
        } catch { toast.error('Failed to load grades') }
        finally { setIsLoading(false) }
    }

    const filtered = grades.filter(g => {
        const matchesCourse = selectedCourse === 'all' || g.courseName.includes(selectedCourse)
        const matchesSearch = g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || g.studentId.toLowerCase().includes(searchQuery.toLowerCase()) || g.courseName.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCourse && matchesSearch
    })

    const avgScore = filtered.length > 0 ? (filtered.reduce((a, g) => a + g.score, 0) / filtered.length).toFixed(1) : '—'

    const exportCSV = () => {
        const csv = [['Student', 'ID', 'Course', 'Assessment', 'Score', 'Total', 'Date'], ...filtered.map(g => [g.studentName, g.studentId, g.courseName, g.assignmentName, g.score, g.totalPoints, g.date])].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'grades_report.csv'; a.click(); URL.revokeObjectURL(url)
    }

    const getGradeBadge = (score: number, total: number) => {
        const pct = (score / total) * 100
        if (pct >= 70) return <Badge className="bg-emerald-100 text-emerald-700">A</Badge>
        if (pct >= 60) return <Badge className="bg-blue-100 text-blue-700">B</Badge>
        if (pct >= 50) return <Badge className="bg-amber-100 text-amber-700">C</Badge>
        if (pct >= 45) return <Badge className="bg-orange-100 text-orange-700">D</Badge>
        return <Badge variant="destructive">F</Badge>
    }

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Grades Overview</h1>
                    <p className="text-muted-foreground">View all submitted grades across courses</p>
                </div>
                <PillButton variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</PillButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card><CardHeader className="pb-2"><CardDescription>Total Grades</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-foreground">{grades.length}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardDescription>Average Score</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-emerald-500">{avgScore}{avgScore !== '—' ? '%' : ''}</p></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardDescription>Courses Tracked</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-foreground">{courses.length}</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Grade Records</CardTitle>
                    <CardDescription>{filtered.length} records shown</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search student, ID, or course..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-full md:w-56"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map(c => <SelectItem key={c._id} value={c.courseName}>{c.courseName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <p className="text-center py-8 text-muted-foreground animate-pulse">Loading grades...</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No grade records found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Assessment</TableHead>
                                    <TableHead className="text-center">Score</TableHead>
                                    <TableHead className="text-center">Grade</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(g => (
                                    <TableRow key={g._id}>
                                        <TableCell>
                                            <p className="font-medium">{g.studentName}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{g.studentId}</p>
                                        </TableCell>
                                        <TableCell className="text-sm">{g.courseName}</TableCell>
                                        <TableCell className="text-sm">{g.assignmentName}</TableCell>
                                        <TableCell className="text-center font-semibold">{g.score}/{g.totalPoints}</TableCell>
                                        <TableCell className="text-center">{getGradeBadge(g.score, g.totalPoints)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{g.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
