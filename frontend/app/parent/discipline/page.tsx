'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Activity, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'
import { PillButton } from '@/components/ui/pill-button'

export default function ParentDisciplinePage() {
  const [child, setChild] = useState<any>(null)
  const [incidents, setIncidents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const loadDiscipline = async () => {
      try {
        const uStr = sessionStorage.getItem('user')
        if (!uStr) return;
        const user = JSON.parse(uStr)

        const isMock = localStorage.getItem('useMockData') === 'true'
        if (isMock) {
          if (mounted) {
            setChild({ name: 'Emma Smith', program: 'Computer Science' })
            setIncidents([
              { _id: '1', dateOfIncident: new Date(Date.now() - 86400000).toISOString(), type: 'Late', description: 'Emma arrived 15 minutes late to class.', teacherId: { firstName: 'Sarah', lastName: 'Johnson', role: 'teacher' } }
            ])
            setAttendance([
              { _id: 'a1', date: new Date(Date.now() - 86400000).toISOString(), status: 'absent' },
              { _id: 'a2', date: new Date(Date.now() - 172800000).toISOString(), status: 'present' }
            ])
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
          })
        }

        if (!profile?._id) {
          setIsLoading(false)
          return;
        }

        const [discRes, attRes] = await Promise.all([
          apiFetch(`/discipline?studentId=${profile._id}`),
          apiFetch(`/attendance?studentId=${profile._id}`)
        ])

        if (!discRes.isMock) {
          setIncidents(discRes.data.data || [])
        }

        if (!attRes.isMock) {
          setAttendance(attRes.data.data || [])
        }

        if (mounted) setIsLoading(false)
      } catch (err) {
        console.error(err)
        if (mounted) setIsLoading(false)
      }
    }
    loadDiscipline()
    return () => { mounted = false }
  }, [])

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading discipline records...</div>
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

  const infractions = incidents.filter(i => i.type !== 'Positive')
  const positiveNotes = incidents.filter(i => i.type === 'Positive')

  const totalPresent = attendance.filter(a => a.status === 'present').length
  const totalAbsent = attendance.filter(a => a.status === 'absent').length
  const totalDays = attendance.length
  const attendanceRate = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0

  const hasPoorConduct = infractions.length > 3

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
          Behavior & Conduct
        </h1>
        <p className="text-muted-foreground">
          School behavior records and discipline status for {child.name}
        </p>
      </div>

      {/* Overall Status */}
      {hasPoorConduct ? (
        <Card className="border-2 border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-full bg-destructive text-destructive-foreground">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-destructive">Attention Required</CardTitle>
                <CardDescription>Multiple behavioral infractions detected</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground font-medium">
              {child.name} has accumulated {infractions.length} recorded conduct incidents this term. Please review the incidents below and set up a meeting with the Registry or the assigned lecturers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-full bg-emerald-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle>Excellent Conduct</CardTitle>
                <CardDescription>{child.name} is demonstrating positive behavior</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              {child.name} has maintained excellent conduct throughout the term. Minimal to zero incidents have been reported by the teaching staff.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Conduct Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Discipline Records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${infractions.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{infractions.length}</div>
            <p className="text-xs text-muted-foreground mt-2">{infractions.length === 0 ? 'No incidents recorded' : 'Total infractions this term'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">0</div>
            <p className="text-xs text-muted-foreground mt-2">No pending meetings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Attendance Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">{totalAbsent} absences this term</p>
          </CardContent>
        </Card>
      </div>

      {/* Discipline Incident Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Incident Timeline
          </CardTitle>
          <CardDescription>Recorded infractions by lecturers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {infractions.length === 0 ? (
            <div className="py-8 text-center border border-dashed rounded-lg text-muted-foreground">
              No behavioral incidents have been logged for this student.
            </div>
          ) : (
            infractions.sort((a, b) => new Date(b.dateOfIncident).getTime() - new Date(a.dateOfIncident).getTime()).map(inc => (
              <div key={inc._id} className="flex flex-col md:flex-row md:items-start gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/50">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 mt-1 shrink-0 w-max">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-base text-red-700 dark:text-red-400">{inc.type}</p>
                    <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-background rounded-md border">
                      {new Date(inc.dateOfIncident).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-foreground mt-2">{inc.description}</p>

                  {inc.actionTaken && (
                    <div className="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded border border-red-100/50 dark:border-red-900/30">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Action Taken</p>
                      <p className="text-sm font-medium">{inc.actionTaken}</p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Logged by:</span>
                    <Badge variant="secondary" className="font-normal capitalize shadow-none">
                      {inc.teacherId?.firstName} {inc.teacherId?.lastName}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Positive Notes */}
      {positiveNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Positive Conduct Notes</CardTitle>
            <CardDescription>Recognition from teachers and staff</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {positiveNotes.map(note => (
              <div key={note._id} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {note.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">By {note.teacherId?.firstName} {note.teacherId?.lastName} • {new Date(note.dateOfIncident).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Attendance Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Attendance Record
          </CardTitle>
          <CardDescription>This academic term</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border text-center bg-muted/20">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Days Present</p>
              <p className="text-4xl font-black text-emerald-500 mt-2">{totalPresent}</p>
            </div>
            <div className="p-4 rounded-lg border border-border text-center bg-muted/20">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Days Absent</p>
              <p className="text-4xl font-black text-amber-600 mt-2">{totalAbsent}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border mt-6">
            <p className="font-bold text-sm text-foreground mb-3 uppercase tracking-wider border-b pb-2">Absences Log</p>
            <div className="space-y-2 pt-2 max-h-[200px] overflow-y-auto pr-2">
              {attendance.filter(a => a.status === 'absent').length === 0 ? (
                <div className="text-muted-foreground text-sm py-2">No absences recorded on file.</div>
              ) : (
                attendance.filter(a => a.status === 'absent').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => (
                  <div key={a._id} className="flex items-center justify-between text-sm p-2 hover:bg-muted/50 rounded-md transition-colors">
                    <span className="font-medium">{new Date(a.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 shadow-none">Absent</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
