'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Activity, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

export default function ParentDisciplinePage() {
    const [child, setChild] = useState<any>(null)
    const [incidents, setIncidents] = useState<any[]>([])
    const [attendance, setAttendance] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

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
                if (mounted) setChild({ name: `${profile.firstName} ${profile.lastName}`, program: profile.program || 'Unassigned' })

                const [discRes, attRes] = await Promise.all([
                    apiFetch(`/discipline?studentId=${profile._id}`),
                    apiFetch(`/attendance?studentId=${profile._id}`)
                ])

                if (mounted) {
                    setIncidents(discRes.data?.data || [])
                    setAttendance(attRes.data?.data || [])
                    setIsLoading(false)
                }
            } catch (err: any) {
                if (mounted) { setError(err.message || 'Failed to load discipline data'); setIsLoading(false) }
                toast.error('Failed to load discipline data')
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    const totalSessions = attendance.length
    const presentCount = attendance.filter(a => a.status === 'present').length
    const absentCount = attendance.filter(a => a.status === 'absent').length
    const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0

    const SEVERITY_COLOR: Record<string, string> = {
        'Late': 'bg-amber-100 text-amber-700 border-amber-200',
        'Absent Without Notice': 'bg-orange-100 text-orange-700 border-orange-200',
        'Misconduct': 'bg-red-100 text-red-700 border-red-200',
        'Cheating': 'bg-rose-100 text-rose-700 border-rose-200',
        'Positive Commendation': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading discipline record...</div>
    if (error) return <div className="p-8 text-center text-destructive">{error}</div>

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Discipline & Attendance</h1>
                {child && <p className="text-muted-foreground">Records for {child.name} — {child.program}</p>}
            </div>

            {!child ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-16 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                        <p className="font-medium">No linked student found</p>
                        <p className="text-sm text-muted-foreground mt-2">Contact Registry to link your account.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="pb-2"><CardDescription>Overall Attendance</CardDescription></CardHeader>
                            <CardContent>
                                <p className={`text-5xl font-bold ${attendancePct >= 75 ? 'text-emerald-500' : 'text-destructive'}`}>{attendancePct}%</p>
                                <p className="text-xs text-muted-foreground mt-1">{presentCount} present / {totalSessions} sessions</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardDescription>Absences</CardDescription></CardHeader>
                            <CardContent>
                                <p className={`text-5xl font-bold ${absentCount === 0 ? 'text-foreground' : 'text-destructive'}`}>{absentCount}</p>
                                <p className="text-xs text-muted-foreground mt-1">total missed sessions</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardDescription>Discipline Incidents</CardDescription></CardHeader>
                            <CardContent>
                                <p className={`text-5xl font-bold ${incidents.length === 0 ? 'text-foreground' : 'text-amber-600'}`}>{incidents.length}</p>
                                <p className="text-xs text-muted-foreground mt-1">reported this semester</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" /> Discipline Records
                            </CardTitle>
                            <CardDescription>Incidents and commendations reported by lecturers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {incidents.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                                    <p className="font-medium">No discipline records</p>
                                    <p className="text-sm mt-1">Your child has a clean record. Keep it up!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {incidents.map((inc: any) => (
                                        <div key={inc._id} className="p-4 rounded-lg border border-border bg-muted/30">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${SEVERITY_COLOR[inc.incidentType] || 'bg-muted text-muted-foreground border-border'}`}>
                                                        {inc.incidentType}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Reported by {inc.teacherId?.firstName} {inc.teacherId?.lastName} · {new Date(inc.date || inc.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground">{inc.description}</p>
                                            {inc.actionTaken && (
                                                <p className="text-sm text-muted-foreground mt-2 italic">Action: {inc.actionTaken}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" /> Recent Absences
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {absentCount === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                                    <p className="font-medium">No absences recorded</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {attendance.filter(a => a.status === 'absent').slice(0, 10).map((a: any) => (
                                        <div key={a._id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                                            <p className="text-sm font-medium text-foreground">{new Date(a.date).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            <Badge variant="destructive">Absent</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
