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
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface GradeStudent { id: string; name: string; rollNo: string; score: number | null; gradeId?: string }

function GradesPageInner() {
    const searchParams = useSearchParams()
    const urlCourseId = searchParams.get('courseId')
    const [courses, setCourses] = useState<any[]>([])
    const [selectedClass, setSelectedClass] = useState(urlCourseId || '')
    const [selectedAssessment, setSelectedAssessment] = useState('Mid-term Exam')
    const [students, setStudents] = useState<GradeStudent[]>([])
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiFetch('/courses')
                const data = res.data?.data || []
                setCourses(data)
                setSelectedClass(prev => prev || data[0]?._id || '')
            } catch { toast.error('Failed to load courses') }
        }
        load()
    }, [])

    useEffect(() => {
        if (!selectedClass) return
        const load = async () => {
            try {
                const [studentsRes, gradesRes] = await Promise.all([
                    apiFetch('/students'),
                    apiFetch(`/grades?courseId=${selectedClass}`)
                ])
                const fetchedGrades = (gradesRes.data?.data || []).filter((g: any) => g.assignmentName === selectedAssessment)
                setStudents((studentsRes.data?.data || []).map((s: any) => {
                    const gr = fetchedGrades.find((g: any) => g.studentId?._id === s._id || g.studentId === s._id)
                    return { id: s._id, name: `${s.firstName} ${s.lastName}`, rollNo: s.studentId, score: gr ? gr.score : null, gradeId: gr?._id }
                }))
            } catch { toast.error('Failed to load grades') }
        }
        load()
    }, [selectedClass, selectedAssessment])

    const handleGradeChange = (id: string, val: string) => {
        const score = val === '' ? null : Math.min(100, Math.max(0, parseInt(val)))
        setStudents(students.map(s => s.id === id ? { ...s, score } : s))
    }

    const saveGrades = async () => {
        setIsSaving(true)
        try {
            const toSave = students.filter(s => s.score !== null)
            await Promise.all(toSave.map(s => {
                if (s.gradeId) {
                    return apiFetch(`/grades/${s.gradeId}`, { method: 'PUT', body: JSON.stringify({ score: s.score }) })
                }
                return apiFetch('/grades', { method: 'POST', body: JSON.stringify({ studentId: s.id, courseId: selectedClass, assignmentName: selectedAssessment, score: s.score, totalPoints: 100 }) })
            }))
            toast.success(`Grades saved for ${toSave.length} students`)
        } catch (err: any) { toast.error('Failed to save grades') }
        finally { setIsSaving(false) }
    }

    const exportCSV = () => {
        const rows = [['Name', 'Roll No', 'Score', 'Grade'], ...students.map(s => {
            const score = s.score
            const grade = score === null ? '—' : score >= 70 ? 'A' : score >= 60 ? 'B' : score >= 50 ? 'C' : score >= 45 ? 'D' : 'F'
            return [s.name, s.rollNo, score ?? '—', grade]
        })]
        const csv = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `grades_${selectedAssessment.replace(/\s/g, '_')}.csv`; a.click()
        URL.revokeObjectURL(url)
    }

    const getGradeBadge = (score: number | null) => {
        if (score === null) return <Badge variant="outline">Pending</Badge>
        if (score >= 70) return <Badge className="bg-emerald-100 text-emerald-700">A</Badge>
        if (score >= 60) return <Badge className="bg-blue-100 text-blue-700">B</Badge>
        if (score >= 50) return <Badge className="bg-amber-100 text-amber-700">C</Badge>
        if (score >= 45) return <Badge className="bg-orange-100 text-orange-700">D</Badge>
        return <Badge variant="destructive">F</Badge>
    }

    const avgScore = students.filter(s => s.score !== null).length > 0
        ? (students.filter(s => s.score !== null).reduce((a, s) => a + (s.score || 0), 0) / students.filter(s => s.score !== null).length).toFixed(1)
        : 'N/A'

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Grades</h1>
                <p className="text-muted-foreground">Submit and manage student grades</p>
            </div>

            <Card>
                <CardHeader><CardTitle>Select Course & Assessment</CardTitle></CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Select course..." /></SelectTrigger>
                        <SelectContent>{courses.map(c => <SelectItem key={c._id} value={c._id}>{c.courseName}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                        <SelectTrigger className="w-full md:w-56"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {['Mid-term Exam', 'Final Exam', 'Quiz 1', 'Quiz 2', 'Assignment 1', 'Project', 'Lab Test'].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {students.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <CardTitle>Grade Entry — {selectedAssessment}</CardTitle>
                                <CardDescription>
                                    {students.filter(s => s.score !== null).length}/{students.length} graded · Class avg: <span className="font-semibold text-foreground">{avgScore}</span>
                                </CardDescription>
                            </div>
                            <PillButton variant="outline" size="sm" onClick={exportCSV}>
                                <Download className="h-4 w-4 mr-2" />Export CSV
                            </PillButton>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Roll No</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="w-36">Score (0–100)</TableHead>
                                    <TableHead className="text-center">Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-mono text-sm">{s.rollNo}</TableCell>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number" min="0" max="100"
                                                value={s.score ?? ''}
                                                onChange={e => handleGradeChange(s.id, e.target.value)}
                                                placeholder="—"
                                                className="w-24"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">{getGradeBadge(s.score)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex justify-end mt-6">
                            <PillButton onClick={saveGrades} disabled={isSaving || students.filter(s => s.score !== null).length === 0}>
                                {isSaving ? 'Saving...' : `Save Grades (${students.filter(s => s.score !== null).length} entered)`}
                            </PillButton>
                        </div>
                    </CardContent>
                </Card>
            )}

            {students.length === 0 && selectedClass && (
                <div className="text-center py-16 border border-dashed rounded-xl text-muted-foreground">
                    <p className="font-medium">No students found for this course.</p>
                </div>
            )}
        </div>
    )
}

export default function TeacherGradesPage() {
    return <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>}><GradesPageInner /></Suspense>
}
