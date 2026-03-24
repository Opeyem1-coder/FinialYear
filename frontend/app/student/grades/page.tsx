'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Award, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'

interface GradeRecord {
    code: string
    title: string
    units: number
    score: number
    grade: string
    points: number
}

interface SemesterRecord {
    id: string
    name: string
    session: string
    gpa: string
    totalUnits: number
    level: number
    semesterIndex: number
    courses: GradeRecord[]
}

const mockGradeHistory: SemesterRecord[] = [
    {
        id: 'sem_300_1',
        name: 'First Semester',
        session: '2023/2024 Academic Session (300 Level)',
        gpa: '4.50',
        totalUnits: 18,
        level: 300,
        semesterIndex: 1,
        courses: [
            { code: 'CSC 301', title: 'Data Structures', units: 3, score: 85, grade: 'A', points: 5 },
            { code: 'CSC 303', title: 'Database Systems', units: 3, score: 92, grade: 'A', points: 5 },
            { code: 'CSC 305', title: 'Operating Systems', units: 3, score: 78, grade: 'B', points: 4 },
        ]
    }
]

export default function StudentGradesPage() {
    const [gradeHistory, setGradeHistory] = useState<SemesterRecord[]>([])
    const [cgpa, setCgpa] = useState('0.00')
    const [totalUnits, setTotalUnits] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [expandedSemesters, setExpandedSemesters] = useState<string[]>([])

    useEffect(() => {
        let mounted = true
        const fetchGrades = async () => {
            try {
                const isMock = localStorage.getItem('useMockData') === 'true'
                if (isMock) {
                    if (mounted) {
                        setGradeHistory(mockGradeHistory)
                        setExpandedSemesters(['sem_300_1'])
                        setCgpa('4.50')
                        setTotalUnits(18)
                        setIsLoading(false)
                    }
                    return;
                }

                const uStr = sessionStorage.getItem('user')
                if (!uStr) return;
                const user = JSON.parse(uStr)

                // 1. Fetch student info
                const studentRes = await apiFetch(`/students?userId=${user._id || user.id}`)
                if (studentRes.isMock || !studentRes.data?.data?.length) {
                    setIsLoading(false)
                    return;
                }
                const profile = studentRes.data.data[0]

                // 2. Fetch all grades
                const gradesRes = await apiFetch(`/grades?studentId=${profile._id}`)
                if (gradesRes.isMock || !gradesRes.data?.data) {
                    setIsLoading(false)
                    return;
                }

                const rawGrades = gradesRes.data.data

                // 3. Group by level and semester
                const semestersMap = new Map<string, SemesterRecord>()
                let cumulativePoints = 0
                let cumulativeUnits = 0

                rawGrades.forEach((g: any) => {
                    if (!g.courseId) return;

                    const courseNameStr = g.courseId.courseName || ''
                    const subjectUnitsStr = g.courseId.subject || '3 Units' // default fallback

                    // Extract code and numbers. e.g. "CSC 301 — Data Structures"
                    const parts = courseNameStr.split('—')
                    const codePart = parts[0].trim()
                    const titlePart = parts.length > 1 ? parts[1].trim() : codePart

                    // Extract unit number (e.g., "3 Units" -> 3)
                    const unitMatch = subjectUnitsStr.match(/(\d+)/)
                    const units = unitMatch ? parseInt(unitMatch[1]) : 3

                    // Infer level and semester from course code
                    const codeMatch = codePart.match(/(\d{3})/)
                    const codeNum = codeMatch ? parseInt(codeMatch[1]) : 100
                    const level = Math.floor(codeNum / 100) * 100
                    const isOdd = codeNum % 2 !== 0
                    const semesterIndex = isOdd ? 1 : 2

                    const score = g.score || 0
                    const outOf = g.totalPoints || 100
                    const percentage = (score / outOf) * 100

                    let gradeLetter = 'F'
                    let points = 0
                    if (percentage >= 70) { gradeLetter = 'A'; points = 5; }
                    else if (percentage >= 60) { gradeLetter = 'B'; points = 4; }
                    else if (percentage >= 50) { gradeLetter = 'C'; points = 3; }
                    else if (percentage >= 45) { gradeLetter = 'D'; points = 2; }
                    else if (percentage >= 40) { gradeLetter = 'E'; points = 1; }

                    const semKey = `sem_${level}_${semesterIndex}`

                    if (!semestersMap.has(semKey)) {
                        semestersMap.set(semKey, {
                            id: semKey,
                            name: semesterIndex === 1 ? 'First Semester' : 'Second Semester',
                            session: `Academic Session (${level} Level)`,
                            gpa: '0.00',
                            totalUnits: 0,
                            level,
                            semesterIndex,
                            courses: []
                        })
                    }

                    const sem = semestersMap.get(semKey)!
                    sem.courses.push({
                        code: codePart,
                        title: titlePart,
                        units,
                        score: percentage,
                        grade: gradeLetter,
                        points
                    })
                    sem.totalUnits += units
                })

                // Group-level calculations
                const finalHistory = Array.from(semestersMap.values()).map(sem => {
                    let semPoints = 0
                    sem.courses.forEach(c => {
                        semPoints += (c.points * c.units)
                        cumulativePoints += (c.points * c.units)
                        cumulativeUnits += c.units
                    })
                    sem.gpa = sem.totalUnits > 0 ? (semPoints / sem.totalUnits).toFixed(2) : '0.00'
                    return sem
                })

                // Sort descending (highest level first, then second semester)
                finalHistory.sort((a, b) => {
                    if (a.level !== b.level) return b.level - a.level
                    return b.semesterIndex - a.semesterIndex
                })

                if (mounted) {
                    setGradeHistory(finalHistory)
                    if (finalHistory.length > 0) {
                        setExpandedSemesters([finalHistory[0].id]) // Expand most recent by default
                    }
                    if (cumulativeUnits > 0) {
                        setCgpa((cumulativePoints / cumulativeUnits).toFixed(2))
                    }
                    setTotalUnits(cumulativeUnits)
                    setIsLoading(false)
                }

            } catch (err) {
                console.error(err)
                if (mounted) setIsLoading(false)
            }
        }
        fetchGrades()
        return () => { mounted = false }
    }, [])

    const toggleSemester = (id: string) => {
        setExpandedSemesters(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-500 dark:text-emerald-400'
            case 'B': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            case 'C': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
            case 'D': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
            case 'E': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            case 'F': return 'bg-destructive/10 text-destructive'
            default: return 'bg-muted text-muted-foreground'
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Grade History...</div>
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
                    Academic Results
                </h1>
                <p className="text-muted-foreground">
                    View your grade history and cumulative performance
                </p>
            </div>

            {/* CGPA Overview */}
            <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-500/10">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-500">
                                <Award className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-200">Current CGPA</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-5xl font-bold text-emerald-500 dark:text-emerald-400">{cgpa}</h2>
                                    <span className="text-xl text-emerald-500/60 dark:text-emerald-400/60">/ 5.00</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 w-full md:w-auto">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Semesters</p>
                                <p className="text-2xl font-bold">{gradeHistory.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Units Cleared</p>
                                <p className="text-2xl font-bold">{totalUnits}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Semester History */}
            <div className="space-y-6">
                <h2 className="text-2xl font-heading font-bold text-foreground pt-4">Grade History</h2>

                {gradeHistory.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                        No final grades have been published to your transcript yet.
                    </div>
                )}

                {gradeHistory.map((semester) => {
                    const isExpanded = expandedSemesters.includes(semester.id)
                    return (
                        <Card key={semester.id} className="transition-all duration-300">
                            <CardHeader
                                className="border-b border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                                onClick={() => toggleSemester(semester.id)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-xl">{semester.level} Level — {semester.name}</CardTitle>
                                            {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                                        </div>
                                        <CardDescription className="mt-1">{semester.session}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Semester GPA</p>
                                            <p className="text-lg font-bold text-primary">{semester.gpa}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Units</p>
                                            <p className="text-lg font-bold text-foreground">{semester.totalUnits}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            {isExpanded && (
                                <CardContent className="p-0 animate-in fade-in slide-in-from-top-2">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[100px]">Course Code</TableHead>
                                                    <TableHead>Course Title</TableHead>
                                                    <TableHead className="text-center">Units</TableHead>
                                                    <TableHead className="text-center">Score</TableHead>
                                                    <TableHead className="text-center w-[100px]">Grade</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {semester.courses.map((course) => (
                                                    <TableRow key={course.code}>
                                                        <TableCell className="font-medium whitespace-nowrap">{course.code}</TableCell>
                                                        <TableCell>{course.title}</TableCell>
                                                        <TableCell className="text-center">{course.units}</TableCell>
                                                        <TableCell className="text-center font-medium">{course.score.toFixed(1)}%</TableCell>
                                                        <TableCell className="text-center">
                                                            <div className={`mx-auto w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${getGradeColor(course.grade)}`}>
                                                                {course.grade}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
