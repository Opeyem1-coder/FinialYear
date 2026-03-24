'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch, isMockMode } from '@/lib/api'
import { toast } from 'sonner'

interface GradeStudent { id: string; name: string; rollNo: string; score: number | null; gradeId?: string }

const MOCK_COURSES = [
    { _id: 'mock-cs301', courseName: 'CSC 301 — Data Structures' },
    { _id: 'mock-cs305', courseName: 'CSC 305 — Operating Systems' },
    { _id: 'mock-mth201', courseName: 'MTH 201 — Linear Algebra' },
]
const MOCK_STUDENTS: GradeStudent[] = [
    { id: '1', name: 'Emma Smith', rollNo: 'STU2024001', score: 92 },
    { id: '2', name: 'Liam Johnson', rollNo: 'STU2024002', score: 85 },
    { id: '3', name: 'Olivia Brown', rollNo: 'STU2024003', score: null },
    { id: '4', name: 'Noah Wilson', rollNo: 'STU2024004', score: 88 },
    { id: '5', name: 'Ava Davis', rollNo: 'STU2024005', score: 95 },
]

function GradesPageInner() {
    const searchParams = useSearchParams()
    const urlCourseId = searchParams.get('courseId')

    const [courses, setCourses] = useState<any[]>([])
    const [selectedClass, setSelectedClass] = useState(urlCourseId || '')
    const [selectedAssessment, setSelectedAssessment] = useState('Mid-term Exam')
    const [students, setStudents] = useState<GradeStudent[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const inMockMode = isMockMode()

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const res = await apiFetch('/courses')
                if (res.isMock || inMockMode) {
                    setCourses(MOCK_COURSES)
                    setSelectedClass(prev => prev || MOCK_COURSES[0]._id)
                } else {
                    setCourses(res.data.data)
                    setSelectedClass(prev => prev || res.data.data[0]?._id || '')
                }
            } catch { setCourses(MOCK_COURSES); setSelectedClass(prev => prev || MOCK_COURSES[0]._id) }
        }
        loadCourses()
    }, [])

    useEffect(() => {
        if (!selectedClass) return
        const loadData = async () => {
            if (inMockMode || selectedClass.startsWith('mock-')) { setStudents(MOCK_STUDENTS); return }
            try {
                const [studentsRes, gradesRes] = await Promise.all([
                    apiFetch('/students'),
                    apiFetch(`/grades?courseId=${selectedClass}`)
                ])
                if (!studentsRes.isMock) {
                    const fetchedGrades = gradesRes.data?.data?.filter((g: any) => g.assignmentName === selectedAssessment) || []
                    setStudents(studentsRes.data.data.map((s: any) => {
                        const gradeRecord = fetchedGrades.find((g: any) => g.studentId?._id === s._id || g.studentId === s._id)
                        return { id: s._id, name: `${s.firstName} ${s.lastName}`, rollNo: s.studentId, score: gradeRecord ? gradeRecord.score : null, gradeId: gradeRecord?._id }
                    }))
                }
            } catch { toast.error('Failed to load student grades') }
        }
        loadData()
    }, [selectedClass, selectedAssessment])

    const handleGradeChange = (id: string, val: string) => {
        const score = val === '' ? null : Math.min(100, Math.max(0, parseInt(val)))
        setStudents(students.map(s => s.id === id ? { ...s, score } : s))
    }

    const saveGrades = async () => {
        if (inMockMode || selectedClass.startsWith('mock-')) { toast.warning('Switch to Live API to save grades.'); return }
        setIsSaving(true)
        try {
            const promises = students.filter(s => s.score !== null).map(s => {
                if (s.gradeId) {
                    return apiFetch(`/grades/${s.gradeId}`, { method: 'PUT', body: JSON.stringify({ score: s.score }) })
                } else {
                    return apiFetch('/grades', { method: 'POST', body: JSON.stringify({ studentId: s.id, courseId: selectedClass, assignmentName: selectedAssessment, score: s.score, totalPoints: 100 }) })
                }
            })
            await Promise.all(promises)
            toast.success(`Grades saved for ${submittedCount} student${submittedCount !== 1 ? 's' : ''}!`)
            // Reload to get gradeIds
            const gradesRes = await apiFetch(`/grades?courseId=${selectedClass}`)
            const fetchedGrades = gradesRes.data?.data?.filter((g: any) => g.assignmentName === selectedAssessment) || []
            setStudents(prev => prev.map(s => {
                const gr = fetchedGrades.find((g: any) => g.studentId?._id === s.id || g.studentId === s.id)
                return gr ? { ...s, gradeId: gr._id } : s
            }))
        } catch { toast.error('Failed to save grades') }
        finally { setIsSaving(false) }
    }

    const exportCSV = () => {
        const courseName = courses.find(c => c._id === selectedClass)?.courseName || 'Grades'
        const rows = [
            ['Roll No', 'Student Name', 'Assessment', 'Score', 'Total', 'Percentage'],
            ...students.map(s => [s.rollNo, s.name, selectedAssessment, s.score ?? 'N/A', 100, s.score !== null ? `${s.score}%` : 'N/A'])
        ]
        const csv = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url
        a.download = `${courseName.replace(/[^a-z0-9]/gi, '_')}_${selectedAssessment.replace(/\s/g, '_')}.csv`
        a.click(); URL.revokeObjectURL(url)
        toast.success('Grades exported as CSV')
    }

    const getGradeColor = (grade: number | null) => {
        if (grade === null) return 'bg-muted text-muted-foreground'
        if (grade >= 90) return 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500'
        if (grade >= 80) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700'
        if (grade >= 70) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700'
        return 'bg-destructive/10 text-destructive'
    }

    const submittedCount = students.filter(s => s.score !== null).length
    const avg = submittedCount > 0 ? (students.filter(s => s.score !== null).reduce((a, s) => a + (s.score || 0), 0) / submittedCount).toFixed(1) : '-'
    const highest = submittedCount > 0 ? Math.max(...students.filter(s => s.score !== null).map(s => s.score || 0)) : '-'

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div><h1 className="text-4xl font-heading font-bold text-foreground mb-2">Grade Management</h1><p className="text-muted-foreground">Enter and manage student grades</p></div>
                <PillButton onClick={exportCSV}><Download className="h-5 w-5 mr-2" />Export CSV</PillButton>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-foreground mb-2 block">Select Course</label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger><SelectValue placeholder="Select course..." /></SelectTrigger>
                                <SelectContent>{courses.map(c => <SelectItem key={c._id} value={c._id}>{c.courseName}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium text-foreground mb-2 block">Assessment</label>
                            <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mid-term Exam">Mid-term Exam</SelectItem>
                                    <SelectItem value="Final Exam">Final Exam</SelectItem>
                                    <SelectItem value="Quiz 1">Quiz 1</SelectItem>
                                    <SelectItem value="Quiz 2">Quiz 2</SelectItem>
                                    <SelectItem value="Project">Project</SelectItem>
                                    <SelectItem value="Assignment 1">Assignment 1</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card><CardHeader className="pb-3"><CardDescription>Grades Submitted</CardDescription></CardHeader><CardContent>
                    <div className="text-3xl font-bold">{submittedCount}/{students.length}</div>
                    <div className="mt-2 w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${students.length ? (submittedCount / students.length) * 100 : 0}%` }} /></div>
                </CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Class Average</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">{avg}{submittedCount > 0 ? '%' : ''}</div><p className="text-xs text-muted-foreground mt-2">Based on submitted grades</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Highest Grade</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">{highest}{typeof highest === 'number' ? '%' : ''}</div><p className="text-xs text-muted-foreground mt-2">In this class</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Student Grades — {selectedAssessment}</CardTitle><CardDescription>{courses.find(c => c._id === selectedClass)?.courseName || ''}</CardDescription></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Roll No</TableHead><TableHead>Student Name</TableHead><TableHead>Score /100</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {students.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.rollNo}</TableCell>
                                        <TableCell>{s.name}</TableCell>
                                        <TableCell><Input type="number" min="0" max="100" value={s.score !== null ? s.score : ''} onChange={e => handleGradeChange(s.id, e.target.value)} placeholder="0–100" className="w-24" /></TableCell>
                                        <TableCell>
                                            {s.score !== null ? (
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(s.score)}`}>{s.score}%</div>
                                                    {s.gradeId ? <Badge variant="success">Saved</Badge> : <Badge variant="warning">Unsaved</Badge>}
                                                </div>
                                            ) : <Badge variant="outline">Pending</Badge>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No students found for this course.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <PillButton onClick={saveGrades} disabled={isSaving || submittedCount === 0}>{isSaving ? 'Saving...' : 'Save All Grades'}</PillButton>
                        <PillButton variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</PillButton>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function TeacherGradesPage() {
    return <Suspense fallback={<div className="p-8 text-muted-foreground">Loading...</div>}><GradesPageInner /></Suspense>
}
