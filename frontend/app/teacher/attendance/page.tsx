'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { apiFetch, isMockMode } from '@/lib/api'
import { toast } from 'sonner'

interface AttendanceRecord { id: string; rollNo: string; name: string; present: boolean | null; attendanceId?: string }

const MOCK_COURSES = [
    { _id: 'mock-cs301', courseName: 'CSC 301 — Data Structures' },
    { _id: 'mock-cs305', courseName: 'CSC 305 — Operating Systems' },
    { _id: 'mock-mth201', courseName: 'MTH 201 — Linear Algebra' },
]
const MOCK_RECORDS: AttendanceRecord[] = [
    { id: '1', rollNo: 'STU2024001', name: 'Emma Smith', present: true },
    { id: '2', rollNo: 'STU2024002', name: 'Liam Johnson', present: true },
    { id: '3', rollNo: 'STU2024003', name: 'Olivia Brown', present: false },
    { id: '4', rollNo: 'STU2024004', name: 'Noah Wilson', present: true },
    { id: '5', rollNo: 'STU2024005', name: 'Ava Davis', present: null },
]

function AttendancePageInner() {
    const searchParams = useSearchParams()
    const urlCourseId = searchParams.get('courseId')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [courses, setCourses] = useState<any[]>([])
    const [selectedClass, setSelectedClass] = useState(urlCourseId || '')
    const [records, setRecords] = useState<AttendanceRecord[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const inMockMode = isMockMode()

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiFetch('/courses')
                if (res.isMock || inMockMode) { setCourses(MOCK_COURSES); setSelectedClass(prev => prev || MOCK_COURSES[0]._id) }
                else { setCourses(res.data.data); setSelectedClass(prev => prev || res.data.data[0]?._id || '') }
            } catch { setCourses(MOCK_COURSES); setSelectedClass(prev => prev || MOCK_COURSES[0]._id) }
        }
        load()
    }, [])

    useEffect(() => {
        if (!selectedClass) return
        const load = async () => {
            if (inMockMode || selectedClass.startsWith('mock-')) { setRecords(MOCK_RECORDS); return }
            try {
                const [studentsRes, attRes] = await Promise.all([apiFetch('/students'), apiFetch('/attendance')])
                if (!studentsRes.isMock) {
                    const allAtt = attRes.data?.data || []
                    const dayAtt = allAtt.filter((a: any) => a.date && new Date(a.date).toISOString().split('T')[0] === selectedDate)
                    setRecords(studentsRes.data.data.map((s: any) => {
                        const aRecord = dayAtt.find((a: any) => a.studentId?._id === s._id || a.studentId === s._id)
                        return { id: s._id, name: `${s.firstName} ${s.lastName}`, rollNo: s.studentId, present: aRecord ? aRecord.status === 'present' : null, attendanceId: aRecord?._id }
                    }))
                }
            } catch { toast.error('Failed to load attendance') }
        }
        load()
    }, [selectedClass, selectedDate])

    const toggle = (id: string, present: boolean) => setRecords(records.map(r => r.id === id ? { ...r, present } : r))

    const markAll = (present: boolean) => setRecords(records.map(r => ({ ...r, present })))

    const saveAttendance = async () => {
        if (inMockMode || selectedClass.startsWith('mock-')) { toast.warning('Switch to Live API to save attendance.'); return }
        setIsSaving(true)
        try {
            const marked = records.filter(r => r.present !== null)
            await Promise.all(marked.map(r => {
                const status = r.present ? 'present' : 'absent'
                if (r.attendanceId) return apiFetch(`/attendance/${r.attendanceId}`, { method: 'PUT', body: JSON.stringify({ status }) })
                return apiFetch('/attendance', { method: 'POST', body: JSON.stringify({ studentId: r.id, date: selectedDate, status }) })
            }))
            toast.success(`Attendance saved for ${marked.length} student${marked.length !== 1 ? 's' : ''}!`)
            // Reload to get IDs
            const attRes = await apiFetch('/attendance')
            const dayAtt = (attRes.data?.data || []).filter((a: any) => a.date && new Date(a.date).toISOString().split('T')[0] === selectedDate)
            setRecords(prev => prev.map(r => {
                const aRecord = dayAtt.find((a: any) => a.studentId?._id === r.id || a.studentId === r.id)
                return aRecord ? { ...r, attendanceId: aRecord._id } : r
            }))
        } catch { toast.error('Failed to save attendance') }
        finally { setIsSaving(false) }
    }

    const presentCount = records.filter(r => r.present === true).length
    const absentCount = records.filter(r => r.present === false).length
    const pendingCount = records.filter(r => r.present === null).length

    return (
        <div className="space-y-8">
            <div><h1 className="text-4xl font-heading font-bold text-foreground mb-2">Attendance Management</h1><p className="text-muted-foreground">Mark and track student attendance</p></div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                            <div className="relative"><Calendar className="absolute left-4 top-3 h-5 w-5 text-muted-foreground pointer-events-none" /><Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="pl-10" /></div>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium text-foreground mb-2 block">Select Course</label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger><SelectValue placeholder="Select course..." /></SelectTrigger>
                                <SelectContent>{courses.map(c => <SelectItem key={c._id} value={c._id}>{c.courseName}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-3"><CardDescription>Total</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">{records.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Present</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-emerald-500">{presentCount}</div><p className="text-xs text-muted-foreground">{records.length ? Math.round(presentCount / records.length * 100) : 0}%</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Absent</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-destructive">{absentCount}</div><p className="text-xs text-muted-foreground">{records.length ? Math.round(absentCount / records.length * 100) : 0}%</p></CardContent></Card>
                <Card><CardHeader className="pb-3"><CardDescription>Pending</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold text-amber-600">{pendingCount}</div><p className="text-xs text-muted-foreground">unmarked</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div><CardTitle>Mark Attendance</CardTitle><CardDescription>Attendance for {selectedDate}</CardDescription></div>
                        <div className="flex gap-2">
                            <PillButton size="sm" variant="outline" onClick={() => markAll(true)}>Mark All Present</PillButton>
                            <PillButton size="sm" variant="outline" onClick={() => markAll(false)}>Mark All Absent</PillButton>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Roll No</TableHead><TableHead>Student Name</TableHead><TableHead className="text-center">Present</TableHead><TableHead className="text-center">Absent</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {records.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.rollNo}</TableCell>
                                        <TableCell>{r.name}</TableCell>
                                        <TableCell className="text-center"><Checkbox checked={r.present === true} onCheckedChange={() => toggle(r.id, true)} /></TableCell>
                                        <TableCell className="text-center"><Checkbox checked={r.present === false} onCheckedChange={() => toggle(r.id, false)} /></TableCell>
                                        <TableCell>
                                            {r.present === true ? <Badge variant="success" className="flex items-center gap-1 w-fit"><Check className="h-3 w-3" />Present</Badge>
                                                : r.present === false ? <Badge variant="destructive" className="flex items-center gap-1 w-fit"><X className="h-3 w-3" />Absent</Badge>
                                                    : <Badge variant="outline">Not Marked</Badge>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {records.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No students found.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-6"><PillButton onClick={saveAttendance} disabled={isSaving || (presentCount + absentCount === 0)}>{isSaving ? 'Saving...' : 'Save Attendance'}</PillButton></div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function TeacherAttendancePage() {
    return <Suspense fallback={<div className="p-8 text-muted-foreground">Loading...</div>}><AttendancePageInner /></Suspense>
}
