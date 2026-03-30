'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'

interface GradeRecord { code: string; title: string; units: number; score: number; grade: string; points: number }
interface SemesterRecord { id: string; name: string; session: string; gpa: string; totalUnits: number; level: number; semesterIndex: number; courses: GradeRecord[] }

const scoreToGrade = (pct: number): { grade: string; points: number } => {
    if (pct >= 70) return { grade: 'A', points: 5 }
    if (pct >= 60) return { grade: 'B', points: 4 }
    if (pct >= 50) return { grade: 'C', points: 3 }
    if (pct >= 45) return { grade: 'D', points: 2 }
    return { grade: 'F', points: 0 }
}

export default function StudentGradesPage() {
    const [gradeHistory, setGradeHistory] = useState<SemesterRecord[]>([])
    const [cgpa, setCgpa] = useState('0.00')
    const [totalUnits, setTotalUnits] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedSemesters, setExpandedSemesters] = useState<string[]>([])

    useEffect(() => {
        let mounted = true
        const fetchGrades = async () => {
            try {
                const uStr = sessionStorage.getItem('user')
                if (!uStr) { setIsLoading(false); return }
                const user = JSON.parse(uStr)

                const studentRes = await apiFetch(`/students?userId=${user._id || user.id}`)
                if (!studentRes.data?.data?.length) { setIsLoading(false); return }
                const profile = studentRes.data.data[0]

                const gradesRes = await apiFetch(`/grades?studentId=${profile._id}`)
                const rawGrades = gradesRes.data?.data || []

                const semestersMap = new Map<string, SemesterRecord>()
                let cumulativePoints = 0
                let cumulativeUnits = 0

                rawGrades.forEach((g: any) => {
                    if (!g.courseId) return
                    const courseNameStr = g.courseId.courseName || ''
                    const subjectUnitsStr = g.courseId.subject || '3 Units'
                    const parts = courseNameStr.split('—')
                    const codePart = parts[0].trim()
                    const titlePart = parts.length > 1 ? parts[1].trim() : codePart
                    const unitMatch = subjectUnitsStr.match(/(\d+)/)
                    const units = unitMatch ? parseInt(unitMatch[1]) : 3
                    const codeMatch = codePart.match(/(\d{3})/)
                    const codeNum = codeMatch ? parseInt(codeMatch[1]) : 100
                    const level = Math.floor(codeNum / 100) * 100
                    const semesterIndex = codeNum % 2 !== 0 ? 1 : 2
                    const score = g.score || 0
                    const outOf = g.totalPoints || 100
                    const pct = Math.min(100, (score / outOf) * 100)
                    const { grade, points } = scoreToGrade(pct)
                    const semKey = `${level}_${semesterIndex}`
                    if (!semestersMap.has(semKey)) {
                        semestersMap.set(semKey, {
                            id: `sem_${semKey}`,
                            name: semesterIndex === 1 ? 'First Semester' : 'Second Semester',
                            session: `${level} Level`,
                            gpa: '0.00',
                            totalUnits: 0,
                            level,
                            semesterIndex,
                            courses: []
                        })
                    }
                    const sem = semestersMap.get(semKey)!
                    sem.courses.push({ code: codePart, title: titlePart, units, score: Math.round(pct), grade, points })
                    sem.totalUnits += units
                    cumulativePoints += points * units
                    cumulativeUnits += units
                })

                semestersMap.forEach(sem => {
                    const semPoints = sem.courses.reduce((acc, c) => acc + c.points * c.units, 0)
                    sem.gpa = sem.totalUnits > 0 ? (semPoints / sem.totalUnits).toFixed(2) : '0.00'
                })

                const sorted = Array.from(semestersMap.values()).sort((a, b) =>
                    a.level !== b.level ? a.level - b.level : a.semesterIndex - b.semesterIndex
                )

                if (mounted) {
                    setGradeHistory(sorted)
                    if (sorted.length > 0) setExpandedSemesters([sorted[sorted.length - 1].id])
                    setCgpa(cumulativeUnits > 0 ? (cumulativePoints / cumulativeUnits).toFixed(2) : '0.00')
                    setTotalUnits(cumulativeUnits)
                    setIsLoading(false)
                }
            } catch (err: any) {
                if (mounted) { setError(err.message || 'Failed to load grades'); setIsLoading(false) }
            }
        }
        fetchGrades()
        return () => { mounted = false }
    }, [])

    const toggleSemester = (id: string) => setExpandedSemesters(prev =>
        prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )

    const getGradeBadge = (grade: string) => {
        const map: Record<string, string> = { A: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', B: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', C: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', D: 'bg-orange-100 text-orange-700', F: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' }
        return map[grade] || 'bg-muted text-muted-foreground'
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading grades...</div>
    if (error) return <div className="p-8 text-center text-destructive">{error}</div>

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Academic Record</h1>
                <p className="text-muted-foreground">Your complete grade history across all semesters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-emerald-200 dark:border-emerald-500/30">
                    <CardHeader className="pb-2"><CardDescription>Cumulative GPA</CardDescription></CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold text-emerald-500">{cgpa}</p>
                        <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardDescription>Total Units Earned</CardDescription></CardHeader>
                    <CardContent><p className="text-5xl font-bold text-foreground">{totalUnits}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardDescription>Semesters Completed</CardDescription></CardHeader>
                    <CardContent><p className="text-5xl font-bold text-foreground">{gradeHistory.length}</p></CardContent>
                </Card>
            </div>

            {gradeHistory.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-xl text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No grade records found</p>
                    <p className="text-sm mt-1">Grades will appear here once submitted by your lecturers.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {gradeHistory.map(sem => (
                        <Card key={sem.id}>
                            <CardHeader
                                className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg"
                                onClick={() => toggleSemester(sem.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{sem.session} — {sem.name}</CardTitle>
                                        <CardDescription>GPA: {sem.gpa} / 5.0 · {sem.totalUnits} Units · {sem.courses.length} Courses</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-bold text-emerald-500">{sem.gpa}</span>
                                        {expandedSemesters.includes(sem.id) ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                                    </div>
                                </div>
                            </CardHeader>
                            {expandedSemesters.includes(sem.id) && (
                                <CardContent className="pt-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Course</TableHead>
                                                <TableHead className="text-center">Units</TableHead>
                                                <TableHead className="text-center">Score</TableHead>
                                                <TableHead className="text-center">Grade</TableHead>
                                                <TableHead className="text-center">Points</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sem.courses.map((c, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>
                                                        <p className="font-medium text-sm">{c.code}</p>
                                                        <p className="text-xs text-muted-foreground">{c.title}</p>
                                                    </TableCell>
                                                    <TableCell className="text-center">{c.units}</TableCell>
                                                    <TableCell className="text-center">{c.score}%</TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getGradeBadge(c.grade)}`}>{c.grade}</span>
                                                    </TableCell>
                                                    <TableCell className="text-center font-semibold">{c.points}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
