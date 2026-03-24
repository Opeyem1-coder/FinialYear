'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'
import { PillButton } from '@/components/ui/pill-button'

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
  courses: GradeRecord[]
}

export default function ParentAcademicsPage() {
  const [child, setChild] = useState<any>(null)
  const [gradeHistory, setGradeHistory] = useState<SemesterRecord[]>([])
  const [cgpa, setCgpa] = useState('0.00')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSemesters, setExpandedSemesters] = useState<string[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const uStr = sessionStorage.getItem('user')
        if (!uStr) return
        const user = JSON.parse(uStr)

        const isMock = localStorage.getItem('useMockData') === 'true'
        if (isMock) {
          setChild({ name: 'Emma Smith' })
          setGradeHistory([{
            id: 'sem_300_1',
            name: 'First Semester',
            session: '2023/2024 (300 Level)',
            gpa: '4.50',
            totalUnits: 18,
            courses: [
              { code: 'CSC 301', title: 'Data Structures', units: 3, score: 85, grade: 'A', points: 5 },
              { code: 'CSC 303', title: 'Database Systems', units: 3, score: 92, grade: 'A', points: 5 },
              { code: 'CSC 305', title: 'Operating Systems', units: 3, score: 78, grade: 'B', points: 4 },
            ]
          }])
          setCgpa('4.28')
          if (mounted) setIsLoading(false)
          return
        }

        // Fetch linked child
        const studentRes = await apiFetch(`/students?parentIds=${user._id || user.id}`)
        let profile = null
        if (!studentRes.isMock && studentRes.data?.data?.length > 0) {
          profile = studentRes.data.data[0]
          setChild({ name: `${profile.firstName} ${profile.lastName}` })
        }

        if (!profile?._id) {
          if (mounted) setIsLoading(false)
          return
        }

        const gradesRes = await apiFetch(`/grades?studentId=${profile._id}`)
        if (!gradesRes.isMock) {
          const rawGrades = gradesRes.data?.data || []

          // Group by course code prefix (level) and semester
          const semesterMap = new Map<string, { level: number; sem: number; courses: GradeRecord[] }>()

          rawGrades.forEach((g: any) => {
            const code: string = g.courseId?.courseName || g.courseId?.subject || 'GEN'
            const numMatch = code.match(/\d{3}/)
            const courseNum = numMatch ? parseInt(numMatch[0]) : 100
            const level = Math.floor(courseNum / 100) * 100
            const sem = courseNum % 100 >= 50 ? 2 : 1
            const key = `${level}_${sem}`

            const score = g.score || 0
            const grade =
              score >= 70 ? 'A' : score >= 60 ? 'B' : score >= 50 ? 'C' : score >= 45 ? 'D' : 'F'
            const gradePoints =
              score >= 70 ? 5 : score >= 60 ? 4 : score >= 50 ? 3 : score >= 45 ? 2 : 0
            const units = g.courseId?.units || 3

            if (!semesterMap.has(key)) semesterMap.set(key, { level, sem, courses: [] })
            semesterMap.get(key)!.courses.push({
              code,
              title: g.assignmentName || g.courseId?.subject || 'Course',
              units,
              score,
              grade,
              points: gradePoints
            })
          })

          const semesters: SemesterRecord[] = []
          semesterMap.forEach(({ level, sem, courses }, key) => {
            const totalWeighted = courses.reduce((acc, c) => acc + c.points * c.units, 0)
            const totalUnits = courses.reduce((acc, c) => acc + c.units, 0)
            const gpa = totalUnits > 0 ? (totalWeighted / totalUnits).toFixed(2) : '0.00'
            semesters.push({
              id: key,
              name: sem === 1 ? 'First Semester' : 'Second Semester',
              session: `${level} Level`,
              gpa,
              totalUnits,
              courses
            })
          })

          semesters.sort((a, b) => {
            const [alevel] = a.id.split('_').map(Number)
            const [blevel] = b.id.split('_').map(Number)
            return blevel - alevel
          })

          setGradeHistory(semesters)

          if (rawGrades.length > 0) {
            const avg = rawGrades.reduce((acc: number, g: any) => acc + (g.score || 0), 0) / rawGrades.length
            setCgpa(((avg / 100) * 5).toFixed(2))
          }
        }

        if (mounted) setIsLoading(false)
      } catch (err) {
        console.error(err)
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const toggleSemester = (id: string) => {
    setExpandedSemesters(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    if (score >= 50) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
    return 'bg-destructive/10 text-destructive'
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400'
      case 'B': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'C': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
      case 'D': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      default: return 'bg-destructive/10 text-destructive'
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading academic records...</div>
  }

  if (!child) {
    return (
      <Card className="p-8 text-center mt-8">
        <h2 className="text-xl font-bold mb-2">No Student Linked</h2>
        <p className="text-muted-foreground mb-4">You do not have any students linked to your parent account.</p>
        <Link href="/registry/parents"><PillButton>Contact Registry</PillButton></Link>
      </Card>
    )
  }

  const latestSemesterGpa = gradeHistory.length > 0 ? gradeHistory[0].gpa : '0.00'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
          Academic Performance
        </h1>
        <p className="text-muted-foreground">
          {child.name}'s grades and academic history
        </p>
      </div>

      {/* CGPA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cumulative GPA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-500">{cgpa}</div>
            <div className="mt-3 w-full bg-muted rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(parseFloat(cgpa) / 5) * 100}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Latest Semester GPA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{latestSemesterGpa}</div>
            <p className="text-xs text-muted-foreground mt-3">{gradeHistory[0]?.session || 'Current'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Semesters Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <p className="text-3xl font-bold text-foreground">{gradeHistory.length}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Recorded semesters</p>
          </CardContent>
        </Card>
      </div>

      {/* Semester History */}
      <h2 className="text-2xl font-heading font-bold text-foreground pt-4">Grade History</h2>
      {gradeHistory.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No grade records found for this student.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {gradeHistory.map((semester) => (
            <Card key={semester.id}>
              <CardHeader
                className="border-b border-border bg-muted/20 cursor-pointer select-none"
                onClick={() => toggleSemester(semester.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{semester.name}</CardTitle>
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
                    {expandedSemesters.includes(semester.id)
                      ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      : <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                </div>
              </CardHeader>
              {expandedSemesters.includes(semester.id) && (
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Course</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead className="text-center">Units</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead className="text-center w-[80px]">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semester.courses.map((course) => (
                          <TableRow key={course.code}>
                            <TableCell className="font-medium whitespace-nowrap">{course.code}</TableCell>
                            <TableCell>{course.title}</TableCell>
                            <TableCell className="text-center">{course.units}</TableCell>
                            <TableCell className="text-center">
                              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(course.score)}`}>
                                {course.score}%
                              </div>
                            </TableCell>
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
          ))}
        </div>
      )}
    </div>
  )
}
