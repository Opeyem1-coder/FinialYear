'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'

interface GradeRecord { code: string; title: string; units: number; score: number; grade: string; points: number }
interface SemesterRecord { id: string; name: string; session: string; gpa: string; totalUnits: number; courses: GradeRecord[] }

const scoreToGrade = (pct: number): { grade: string; points: number } => {
    if (pct >= 70) return { grade: 'A', points: 5 }
    if (pct >= 60) return { grade: 'B', points: 4 }
    if (pct >= 50) return { grade: 'C', points: 3 }
    if (pct >= 45) return { grade: 'D', points: 2 }
    return { grade: 'F', points: 0 }
}

export default function ParentAcademicsPage() {
    const [child, setChild] = useState<any>(null)
    const [gradeHistory, setGradeHistory] = useState<SemesterRecord[]>([])
    const [cgpa, setCgpa] = useState('0.00')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedSemesters, setExpandedSemesters] = useState<string[]>([])

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const uStr = sessionStorage.getItem('user')
                if (!uStr) { setIsLoading(false); return }
                const user = JSON.parse(uStr)

                const studentRes = await apiFetch(`/students?parentIds=${user._id || user.id}`)
                if (!studentRes.data?.data?.length) { setIsLoading(false); return }
                const profile = studentRes.data.data[0]
                if (mounted) setChild({ name: `${profile.firstName} ${profile.lastName}`, program: profile.program })

                const gradesRes = await apiFetch(`/grades?studentId=${profile._id}`)
                const rawGrades = gradesRes.data?.data || []

                const semMap = new Map<string, SemesterRecord>()
                let cumPoints = 0; let cumUnits = 0
                rawGrades.forEach((g: any) => {
                    if (!g.courseId) return
                    const nameStr = g.courseId.courseName || ''
                    const subStr = g.courseId.subject || '3 Units'
                    const parts = nameStr.split('—')
                    const codePart = parts[0].trim()
                    const titlePart = parts[1]?.trim() || codePart
                    const unitMatch = subStr.match(/(\d+)/); const units = unitMatch ? parseInt(unitMatch[1]) : 3
                    const codeMatch = codePart.match(/(\d{3})/); const codeNum = codeMatch ? parseInt(codeMatch[1]) : 100
                    const level = Math.floor(codeNum / 100) * 100
                    const semIdx = codeNum % 2 !== 0 ? 1 : 2
                    const pct = Math.min(100, ((g.score || 0) / (g.totalPoints || 100)) * 100)
                    const { grade, points } = scoreToGrade(pct)
                    const key = `${level}_${semIdx}`
                    if (!semMap.has(key)) semMap.set(key, { id: `sem_${key}`, name: semIdx === 1 ? 'First Semester' : 'Second Semester', session: `${level} Level`, gpa: '0.00', totalUnits: 0, courses: [] })
                    const sem = semMap.get(key)!
                    sem.courses.push({ code: codePart, title: titlePart, units, score: Math.round(pct), grade, points })
                    sem.totalUnits += units; cumPoints += points * units; cumUnits += units
                })
                semMap.forEach(sem => {
                    const sp = sem.courses.reduce((a, c) => a + c.points * c.units, 0)
                    sem.gpa = sem.totalUnits > 0 ? (sp / sem.totalUnits).toFixed(2) : '0.00'
                })
                const sorted = Array.from(semMap.values()).sort((a, b) => a.id.localeCompare(b.id))
                if (mounted) {
                    setGradeHistory(sorted)
                    if (sorted.length) setExpandedSemesters([sorted[sorted.length - 1].id])
                    setCgpa(cumUnits > 0 ? (cumPoints / cumUnits).toFixed(2) : '0.00')
                    setIsLoading(false)
                }
            } catch (err: any) {
                if (mounted) { setError(err.message || 'Failed to load academic record'); setIsLoading(false) }
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    const toggle = (id: string) => setExpandedSemesters(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

    const gradeColor: Record<string, string> = { A: 'text-emerald-600', B: 'text-blue-600', C: 'text-amber-600', D: 'text-orange-600', F: 'text-destructive' }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading academic record...</div>
    if (error) return <div className="p-8 text-center text-destructive">{error}</div>

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Academic Record</h1>
                {child && <p className="text-muted-foreground">Viewing transcript for {child.name} — {child.program}</p>}
            </div>

            {!child ? (
                <p className="text-muted-foreground text-center py-16">No linked student found. Contact Registry.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-2 border-emerald-200 dark:border-emerald-500/30">
                            <CardHeader className="pb-2"><CardDescription>Cumulative GPA</CardDescription></CardHeader>
                            <CardContent><p className="text-5xl font-bold text-emerald-500">{cgpa}</p><p className="text-xs text-muted-foreground mt-1">out of 5.0</p></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardDescription>Semesters</CardDescription></CardHeader>
                            <CardContent><p className="text-5xl font-bold text-foreground">{gradeHistory.length}</p></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardDescription>Total Units</CardDescription></CardHeader>
                            <CardContent><p className="text-5xl font-bold text-foreground">{gradeHistory.reduce((a, s) => a + s.totalUnits, 0)}</p></CardContent>
                        </Card>
                    </div>

                    {gradeHistory.length === 0 ? (
                        <div className="text-center py-16 border border-dashed rounded-xl text-muted-foreground">
                            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No grade records found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {gradeHistory.map(sem => (
                                <Card key={sem.id}>
                                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg" onClick={() => toggle(sem.id)}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{sem.session} — {sem.name}</CardTitle>
                                                <CardDescription>GPA: {sem.gpa} / 5.0 · {sem.totalUnits} Units</CardDescription>
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
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {sem.courses.map((c, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell><p className="font-medium text-sm">{c.code}</p><p className="text-xs text-muted-foreground">{c.title}</p></TableCell>
                                                            <TableCell className="text-center">{c.units}</TableCell>
                                                            <TableCell className="text-center">{c.score}%</TableCell>
                                                            <TableCell className="text-center font-bold">
                                                                <span className={gradeColor[c.grade] || 'text-foreground'}>{c.grade}</span>
                                                            </TableCell>
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
                </>
            )}
        </div>
    )
}
