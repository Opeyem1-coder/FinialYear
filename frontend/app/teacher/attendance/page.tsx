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
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface AttendanceRecord { id: string; rollNo: string; name: string; present: boolean | null; attendanceId?: string }

function AttendancePageInner() {
    const searchParams = useSearchParams()
    const urlCourseId = searchParams.get('courseId')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [courses, setCourses] = useState<any[]>([])
    const [selectedClass, setSelectedClass] = useState(urlCourseId || '')
    const [records, setRecords] = useState<AttendanceRecord[]>([])
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
                const [studentsRes, attRes] = await Promise.all([apiFetch('/students'), apiFetch('/attendance')])
                const allAtt = attRes.data?.data || []
                const dayAtt = allAtt.filter((a: any) => a.date && new Date(a.date).toISOString().split('T')[0] === selectedDate)
                setRecords((studentsRes.data?.data || []).map((s: any) => {
                    const aRecord = dayAtt.find((a: any) => a.studentId?._id === s._id || a.studentId === s._id)
                    return { id: s._id, name: `${s.firstName} ${s.lastName}`, rollNo: s.studentId, present: aRecord ? aRecord.status === 'present' : null, attendanceId: aRecord?._id }
                }))
            } catch { toast.error('Failed to load attendance') }
        }
        load()
    }, [selectedClass, selectedDate])

    const toggle = (id: string, present: boolean) => setRecords(records.map(r => r.id === id ? { ...r, present } : r))
    const markAll = (present: boolean) => setRecords(records.map(r => ({ ...r, present })))

    const saveAttendance = async () => {
        setIsSaving(true)
        try {
            const marked = records.filter(r => r.present !== null)
            await Promise.all(marked.map(r => {
                if (r.attendanceId) {
                    return apiFetch(`/attendance/${r.attendanceId}`, { method: 'PUT', body: JSON.stringify({ status: r.present ? 'present' : 'absent' }) })
                }
                return apiFetch('/attendance', { method: 'POST', body: JSON.stringify({ studentId: r.id, courseId: selectedClass, date: selectedDate, status: r.present ? 'present' : 'absent' }) })
            }))
            toast.success(`Attendance saved for ${marked.length} students`)
        } catch (err: any) { toast.error('Failed to save attendance') }
        finally { setIsSaving(false) }
    }

    const presentCount = records.filter(r => r.present === true).length
    const absentCount = records.filter(r => r.present === false).length
    const unmarkedCount = records.filter(r => r.present === null).length

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Attendance</h1>
                <p className="text-muted-foreground">Record attendance for your classes</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Select Class & Date</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select course..." />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map(c => <SelectItem key={c._id} value={c._id}>{c.courseName}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full md:w-48" />
                </CardContent>
            </Card>

            {records.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <CardTitle>Student List</CardTitle>
                                <CardDescription>
                                    <span className="text-emerald-500 font-medium">{presentCount} present</span> · <span className="text-destructive font-medium">{absentCount} absent</span> · <span className="text-muted-foreground">{unmarkedCount} unmarked</span>
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <PillButton variant="outline" size="sm" onClick={() => markAll(true)}>
                                    <Check className="h-4 w-4 mr-1" />All Present
                                </PillButton>
                                <PillButton variant="outline" size="sm" onClick={() => markAll(false)}>
                                    <X className="h-4 w-4 mr-1" />All Absent
                                </PillButton>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Roll No</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-center">Present</TableHead>
                                    <TableHead className="text-center">Absent</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-mono text-sm">{r.rollNo}</TableCell>
                                        <TableCell className="font-medium">{r.name}</TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox checked={r.present === true} onCheckedChange={() => toggle(r.id, true)} className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox checked={r.present === false} onCheckedChange={() => toggle(r.id, false)} className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {r.present === null
                                                ? <Badge variant="outline">Unmarked</Badge>
                                                : r.present
                                                    ? <Badge variant="success">Present</Badge>
                                                    : <Badge variant="destructive">Absent</Badge>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex justify-end mt-6">
                            <PillButton onClick={saveAttendance} disabled={isSaving || records.filter(r => r.present !== null).length === 0}>
                                {isSaving ? 'Saving...' : `Save Attendance (${records.filter(r => r.present !== null).length} marked)`}
                            </PillButton>
                        </div>
                    </CardContent>
                </Card>
            )}

            {records.length === 0 && selectedClass && (
                <div className="text-center py-16 border border-dashed rounded-xl text-muted-foreground">
                    <p className="font-medium">No students found for this course.</p>
                    <p className="text-sm mt-1">Ensure students are enrolled via the Registry.</p>
                </div>
            )}
        </div>
    )
}

export default function TeacherAttendancePage() {
    return <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>}><AttendancePageInner /></Suspense>
}
