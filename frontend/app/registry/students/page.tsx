'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Search, Plus, UserCheck, MoreVertical, Edit2, Trash2 } from 'lucide-react'

export default function RegistryStudentsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)

    const [students, setStudents] = useState<any[]>([])
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', dateOfBirth: '', program: 'Computer Science', level: '100 Level'
    })

    const loadStudents = async () => {
        try {
            const res = await apiFetch('/students')
            if (res.isMock) {
                setStudents([
                    { id: 'STU2024001', name: 'Alaxendra Smith', program: 'Computer Science', level: '100 Level', status: 'Active', enrolled: 'Sept 2024' },
                    { id: 'STU2024002', name: 'Benjamin Tyler', program: 'Software Engineering', level: '200 Level', status: 'Active', enrolled: 'Sept 2023' },
                    { id: 'STU2024003', name: 'Chloe Davis', program: 'Information Systems', level: '300 Level', status: 'Suspended', enrolled: 'Sept 2022' },
                ])
            } else {
                setStudents(res.data.data.map((s: any) => ({
                    id: s.studentId,
                    name: `${s.firstName} ${s.lastName}`,
                    program: s.program || 'General',
                    level: s.level || '100 Level',
                    status: 'Active',
                    enrolled: new Date(s.createdAt).toLocaleDateString()
                })))
            }
        } catch (err) {
            console.error('Failed to load students', err)
        }
    }

    useEffect(() => {
        loadStudents()
    }, [])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // First create the actual user account (so they can login)
            const userRes = await apiFetch('/users', {
                method: 'POST',
                body: JSON.stringify({
                    username: formData.email, // using email as username
                    password: 'TempPass123!',
                    role: 'student',
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email
                })
            })

            if (!userRes.isMock) {
                const userId = userRes.data.data._id
                const studentId = `STU${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`

                // Then create the student profile linked to the user account
                await apiFetch('/students', {
                    method: 'POST',
                    body: JSON.stringify({
                        studentId,
                        userId,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        dateOfBirth: formData.dateOfBirth,
                        program: formData.program,
                        level: formData.level
                    })
                })
            }

            setIsRegistering(false)
            setFormData({ firstName: '', lastName: '', email: '', dateOfBirth: '', program: 'Computer Science', level: '100 Level' })
            loadStudents() // Refresh table
        } catch (err) {
            console.error('Registration failed', err)
            alert('Failed to register student. See console for details.')
        }
    }

    const handleDelete = async (studentId: string, studentName: string) => {
        if (!confirm(`Are you sure you want to delete ${studentName}?`)) return

        try {
            await apiFetch(`/students/${studentId}`, {
                method: 'DELETE'
            })
            loadStudents()
            alert('Student deleted successfully')
        } catch (err) {
            console.error('Delete failed', err)
            alert('Failed to delete student')
        }
    }

    const handleMoreOptions = (studentId: string, studentName: string) => {
        alert(`More options menu for: ${studentName}`)
        console.log('Show more options for:', studentId)
    }

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.program.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Student Registry</h1>
                    <p className="text-muted-foreground mt-1">Manage and register student accounts.</p>
                </div>
                {!isRegistering && (
                    <PillButton onClick={() => setIsRegistering(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Register Student
                    </PillButton>
                )}
            </div>

            {isRegistering ? (
                <Card className="border-emerald-500/20 shadow-md">
                    <CardHeader className="border-b bg-emerald-500/5 pb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Register New Student</CardTitle>
                                <CardDescription className="mt-1">Add a new student profile to the university registry.</CardDescription>
                            </div>
                            <PillButton variant="ghost" onClick={() => setIsRegistering(false)}>Cancel</PillButton>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form className="space-y-6" onSubmit={handleRegister}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <Input placeholder="e.g. John" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <Input placeholder="e.g. Doe" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input type="email" placeholder="john.doe@university.edu" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date of Birth</label>
                                    <Input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Program / Major</label>
                                    <select required value={formData.program} onChange={e => setFormData({ ...formData, program: e.target.value })} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                                        <option>Computer Science</option>
                                        <option>Software Engineering</option>
                                        <option>Information Systems</option>
                                        <option>Cybersecurity</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Current Level</label>
                                    <select required value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                                        <option>100 Level</option>
                                        <option>200 Level</option>
                                        <option>300 Level</option>
                                        <option>400 Level</option>
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Temporary Password</label>
                                    <Input type="text" defaultValue="TempPass123!" readOnly className="bg-muted text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">This password will be sent to the student. They must change it upon first login.</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <PillButton type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                    Create Student Profile
                                </PillButton>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
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
                                    Total Active: <span className="font-bold text-foreground">{filteredStudents.length}</span>
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold rounded-tl-md">Student Info</th>
                                        <th className="px-6 py-4 font-semibold">Program</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right rounded-tr-md">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 flex-shrink-0">
                                                            <span className="text-emerald-500 font-semibold">{student.name.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-foreground">{student.name}</div>
                                                            <div className="text-muted-foreground text-xs mt-0.5">{student.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-foreground">{student.program}</div>
                                                    <div className="text-muted-foreground text-xs">{student.level}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {student.status === 'Active' ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                                            <UserCheck className="h-3 w-3 mr-1" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                                                            Suspended
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => alert('Edit functionality - form update would go here')}
                                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                                                            title="Edit student"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(student.id, student.name)}
                                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                                            title="Delete student"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleMoreOptions(student.id, student.name)}
                                                            className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
                                                            title="More options"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                No students found matching "{searchQuery}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
