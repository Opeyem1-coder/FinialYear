'use client'

import { useState, useEffect } from 'react'
import { BookOpen, TrendingUp, AlertCircle, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

export default function ParentDashboard() {
  const [parentName, setParentName] = useState('Parent')
  const [child, setChild] = useState<any>(null)
  const [grades, setGrades] = useState<any[]>([])
  const [attendanceStat, setAttendanceStat] = useState('N/A')
  const [messagesCount, setMessagesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const loadDashboard = async () => {
      try {
        const uStr = sessionStorage.getItem('user')
        if (!uStr) return;
        const user = JSON.parse(uStr)
        if (mounted) setParentName(user.firstName || user.name || 'Parent')

        const isMock = localStorage.getItem('useMockData') === 'true'
        if (isMock) {
          if (mounted) {
            setChild({
              name: 'Emma Smith',
              program: 'Computer Science',
              level: '300 Level',
              semester: '2nd Semester',
              gpa: '4.2/5.0',
            })
            setGrades([
              { assignmentName: 'Mathematics Exam', courseId: { courseName: 'CSC 301' }, score: 92 },
              { assignmentName: 'Science Project', courseId: { courseName: 'CSC 305' }, score: 88 }
            ])
            setAttendanceStat('91%')
            setMessagesCount(2)
            setIsLoading(false)
          }
          return;
        }

        const studentRes = await apiFetch(`/students?parentIds=${user._id || user.id}`)
        let profile = null
        if (!studentRes.isMock && studentRes.data?.data?.length > 0) {
          profile = studentRes.data.data[0]
          setChild({
            name: `${profile.firstName} ${profile.lastName}`,
            program: profile.program || 'Unassigned',
            level: profile.level || 'Unassigned',
            semester: 'Current',
            gpa: 'N/A'
          })
        }

        if (!profile?._id) {
          setIsLoading(false)
          return;
        }

        const [gradesRes, attRes, msgRes] = await Promise.all([
          apiFetch(`/grades?studentId=${profile._id}`),
          apiFetch(`/attendance?studentId=${profile._id}`),
          apiFetch(`/messages`)
        ])

        if (!gradesRes.isMock) {
          const rawGrades = gradesRes.data.data || []
          setGrades(rawGrades.slice(0, 3))
          if (rawGrades.length > 0) {
            const avg = rawGrades.reduce((acc: number, g: any) => acc + (g.score || 0), 0) / rawGrades.length
            const gpa = ((avg / 100) * 5.0).toFixed(2) + '/5.0'
            setChild((prev: any) => ({ ...prev, gpa }))
          }
        }

        if (!attRes.isMock) {
          const att = attRes.data.data || []
          if (att.length > 0) {
            const present = att.filter((a: any) => a.status === 'present').length
            setAttendanceStat(`${((present / att.length) * 100).toFixed(0)}%`)
          } else {
            setAttendanceStat('No records')
          }
        }

        if (!msgRes.isMock) {
          const msgs = msgRes.data.data || []
          const unread = msgs.filter((m: any) => !m.isRead && m.receiverId?._id === (user._id || user.id)).length
          setMessagesCount(unread)
        }

        if (mounted) setIsLoading(false)
      } catch (err) {
        console.error(err)
        if (mounted) setIsLoading(false)
      }
    }
    loadDashboard()
    return () => { mounted = false }
  }, [])

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
          Welcome back, {parentName}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of {child?.name || 'your child'}'s academic performance and school activities
        </p>
      </div>

      {child ? (
        <>
          {/* Child Info Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{child.name}</CardTitle>
                  <CardDescription>{child.program} — {child.level}</CardDescription>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-xs text-muted-foreground font-medium">Program</p>
                  <p className="text-sm font-bold text-foreground mt-1 truncate">{child.program}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/20">
                  <p className="text-xs text-muted-foreground font-medium">CGPA</p>
                  <p className="text-lg font-bold text-foreground mt-1">{child.gpa}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-xs text-muted-foreground font-medium">Attendance</p>
                  <p className="text-lg font-bold text-foreground mt-1">{attendanceStat}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <p className="text-xs text-muted-foreground font-medium">Semester</p>
                  <p className="text-sm font-bold text-foreground mt-1">{child.semester}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Latest CGPA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">{child.gpa.split('/')[0]}</div>
                <p className="text-xs text-muted-foreground mt-1">Cumulative Grade</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Attendance Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{attendanceStat}</div>
                <p className="text-xs text-muted-foreground mt-1">Overall</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Unread Messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{messagesCount}</div>
                <p className="text-xs text-muted-foreground mt-1">From school staff</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending Actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">0</div>
                <p className="text-xs text-muted-foreground mt-1">All clear</p>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Grades */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Recent Grades
                </CardTitle>
                <CardDescription>Latest assessments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 flex flex-col flex-1">
                <div className="space-y-2 flex-1">
                  {grades.map((g, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                      <div>
                        <p className="font-medium text-sm text-foreground">{g.assignmentName}</p>
                        <p className="text-xs text-muted-foreground">{g.courseId?.courseName || 'Course'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-500">{g.score}%</p>
                        <p className="text-xs text-muted-foreground">{g.score >= 70 ? 'Pass' : 'Review'}</p>
                      </div>
                    </div>
                  ))}
                  {grades.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                      No recent grades submitted.
                    </div>
                  )}
                </div>
                <div className="mt-auto pt-4">
                  <Link href="/parent/academics">
                    <PillButton fullWidth variant="secondary">
                      View Full Academic Record
                    </PillButton>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Messages & Communications */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                  Messages
                </CardTitle>
                <CardDescription>Communication with lecturers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 flex flex-col flex-1">
                <div className="p-4 flex-1 flex flex-col items-center justify-center border border-dashed rounded-lg border-border bg-muted/20">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm font-medium">Check your Inbox</p>
                  <p className="text-xs text-muted-foreground text-center">You have {messagesCount} unread message(s).</p>
                </div>
                <div className="mt-auto pt-4">
                  <Link href="/parent/messages">
                    <PillButton fullWidth variant="secondary">
                      View All Messages
                    </PillButton>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Behavior & Discipline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-emerald-500" />
                Behavior & Discipline
              </CardTitle>
              <CardDescription>School conduct records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/10">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-emerald-600 dark:text-emerald-100">Excellent Conduct</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-200 mt-1">
                      {child.name} is demonstrating positive behavior and showing respect to peers and faculty.
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/parent/discipline">
                <PillButton fullWidth variant="secondary" className="mt-4">
                  View Detailed Records
                </PillButton>
              </Link>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No Student Linked</h2>
          <p className="text-muted-foreground mb-4">You do not have any students linked to your parent account.</p>
          <Link href="/registry/parents"><PillButton>Contact Registry</PillButton></Link>
        </Card>
      )}
    </div>
  )
}
