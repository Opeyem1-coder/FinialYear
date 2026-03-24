'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Link as LinkIcon, MoreVertical, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface Student {
    _id: string
    studentId: string
    firstName: string
    lastName: string
    program: string
    level: string
    parentIds: any[]
}

interface Parent {
    _id: string
    firstName: string
    lastName: string
    email: string
}

export default function LinkAccountsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [students, setStudents] = useState<Student[]>([])
    const [parents, setParents] = useState<Parent[]>([])
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [selectedParentIds, setSelectedParentIds] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Load students and parents on mount
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [studentsRes, usersRes] = await Promise.all([
                apiFetch('/students'),
                apiFetch('/users')
            ])

            if (studentsRes.isMock) {
                setStudents([
                    { _id: '1', studentId: 'STU2024001', firstName: 'Alexandra', lastName: 'Smith', program: 'Computer Science', level: '100 Level', parentIds: [] },
                    { _id: '2', studentId: 'STU2024002', firstName: 'Benjamin', lastName: 'Tyler', program: 'Software Engineering', level: '200 Level', parentIds: [] },
                ])
                setParents([
                    { _id: '1', firstName: 'Michael', lastName: 'Johnson', email: 'michael.j@example.com' },
                    { _id: '2', firstName: 'Sarah', lastName: 'Williams', email: 'swilliams@example.com' },
                ])
            } else {
                setStudents(studentsRes.data?.data || [])
                const parentsList = usersRes.data?.data?.filter((u: any) => u.role === 'parent') || []
                setParents(parentsList)
            }
        } catch (err) {
            console.error('Failed to load data', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenStudent = (student: Student) => {
        setSelectedStudent(student)
        setSelectedParentIds(student.parentIds?.map((p: any) => p._id || p) || [])
    }

    const handleToggleParent = (parentId: string) => {
        setSelectedParentIds(prev =>
            prev.includes(parentId)
                ? prev.filter(id => id !== parentId)
                : [...prev, parentId]
        )
    }

    const handleSaveLinks = async () => {
        if (!selectedStudent) return

        setIsSaving(true)
        try {
            await apiFetch(`/students/${selectedStudent._id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    parentIds: selectedParentIds
                })
            })

            // Update local state
            setStudents(prev =>
                prev.map(s =>
                    s._id === selectedStudent._id
                        ? { ...s, parentIds: selectedParentIds }
                        : s
                )
            )

            setSelectedStudent(null)
            alert('Parent links updated successfully!')
        } catch (err) {
            console.error('Failed to save links', err)
            alert('Failed to save parent links. See console for details.')
        } finally {
            setIsSaving(false)
        }
    }

    const filteredStudents = students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.program.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getParentName = (parentId: string) => {
        const parent = parents.find(p => p._id === parentId)
        return parent ? `${parent.firstName} ${parent.lastName}` : 'Unknown'
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
                        <LinkIcon className="h-8 w-8 text-blue-500" />
                        Link Parent Accounts
                    </h1>
                    <p className="text-muted-foreground mt-1">Connect parents to their children's student accounts.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students by name, ID, or program..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground border border-border rounded-md px-3 py-1">
                                Total: <span className="font-bold text-foreground">{filteredStudents.length}</span>
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading students and parents...</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No students found. Register a student first.</div>
                    ) : (
                        <div className="space-y-3">
                            {filteredStudents.map(student => (
                                <div key={student._id} className="rounded-md border p-4 hover:border-blue-300 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 flex-shrink-0">
                                                    <span className="text-blue-500 font-semibold">
                                                        {`${student.firstName} ${student.lastName}`.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">
                                                        {student.firstName} {student.lastName}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">{student.studentId}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 ml-13 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Program: </span>
                                                    <span className="text-foreground font-medium">{student.program}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Level: </span>
                                                    <span className="text-foreground font-medium">{student.level}</span>
                                                </div>
                                            </div>
                                            {student.parentIds && student.parentIds.length > 0 && (
                                                <div className="mt-2 ml-13">
                                                    <p className="text-xs text-muted-foreground mb-1">Linked Parents:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {student.parentIds.map((parentId: any) => (
                                                            <span
                                                                key={parentId._id || parentId}
                                                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                                            >
                                                                {typeof parentId === 'object' 
                                                                    ? `${parentId.firstName} ${parentId.lastName}`
                                                                    : getParentName(parentId)
                                                                }
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <PillButton 
                                                    variant="outline"
                                                    className="flex items-center gap-2 mt-2"
                                                    onClick={() => handleOpenStudent(student)}
                                                >
                                                    <LinkIcon className="h-4 w-4" />
                                                    Link Parents
                                                </PillButton>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Link Parents to Student</DialogTitle>
                                                    <DialogDescription>
                                                        {student.firstName} {student.lastName} ({student.studentId})
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="space-y-4">
                                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                                        {parents.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                                No parents registered. Register parents first in Parent Registry.
                                                            </p>
                                                        ) : (
                                                            parents.map(parent => (
                                                                <div key={parent._id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                                                    <Checkbox
                                                                        id={parent._id}
                                                                        checked={selectedParentIds.includes(parent._id)}
                                                                        onCheckedChange={() => handleToggleParent(parent._id)}
                                                                    />
                                                                    <label
                                                                        htmlFor={parent._id}
                                                                        className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                    >
                                                                        <div className="text-foreground">{parent.firstName} {parent.lastName}</div>
                                                                        <div className="text-xs text-muted-foreground">{parent.email}</div>
                                                                    </label>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                                        <DialogTrigger asChild>
                                                            <PillButton variant="outline">Cancel</PillButton>
                                                        </DialogTrigger>
                                                        <PillButton
                                                            onClick={handleSaveLinks}
                                                            disabled={isSaving}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white"
                                                        >
                                                            {isSaving ? 'Saving...' : 'Save Links'}
                                                        </PillButton>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
