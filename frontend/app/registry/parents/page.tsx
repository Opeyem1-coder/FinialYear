'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Search, Plus, Users, Edit2, Trash2, Link as LinkIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Parent { _id: string; id: string; name: string; firstName: string; lastName: string; email: string; status: string }

export default function RegistryParentsPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [parents, setParents] = useState<Parent[]>([])
    const [isRegistering, setIsRegistering] = useState(false)
    const [editingParent, setEditingParent] = useState<Parent | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' })
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' })

    const loadParents = async () => {
        try {
            const res = await apiFetch('/users')
            const parentsList = (res.data?.data || []).filter((u: any) => u.role === 'parent')
            setParents(parentsList.map((p: any) => ({
                _id: p._id, id: p._id.substring(0, 8).toUpperCase(),
                name: `${p.firstName} ${p.lastName}`, firstName: p.firstName, lastName: p.lastName,
                email: p.email || '', status: 'Active'
            })))
        } catch { toast.error('Failed to load parents') }
    }

    useEffect(() => { loadParents() }, [])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.firstName || !formData.lastName || !formData.email) { toast.error('Please fill in all required fields'); return }
        setIsSubmitting(true)
        try {
            await apiFetch('/users', { method: 'POST', body: JSON.stringify({ username: formData.email, password: 'TempPass123!', role: 'parent', firstName: formData.firstName, lastName: formData.lastName, email: formData.email }) })
            toast.success(`${formData.firstName} ${formData.lastName} registered! Temp password: TempPass123!`)
            setIsRegistering(false)
            setFormData({ firstName: '', lastName: '', email: '', phone: '' })
            loadParents()
        } catch (err: any) { toast.error(err.message || 'Registration failed') }
        finally { setIsSubmitting(false) }
    }

    const openEdit = (p: Parent) => { setEditingParent(p); setEditForm({ firstName: p.firstName, lastName: p.lastName, email: p.email }) }

    const handleEdit = async () => {
        if (!editingParent) return
        setIsSubmitting(true)
        try {
            await apiFetch(`/users/${editingParent._id}`, { method: 'PUT', body: JSON.stringify({ firstName: editForm.firstName, lastName: editForm.lastName }) })
            toast.success('Parent updated')
            setEditingParent(null)
            loadParents()
        } catch (err: any) { toast.error(err.message || 'Update failed') }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this parent account?')) return
        try {
            await apiFetch(`/users/${id}`, { method: 'DELETE' })
            toast.success('Parent removed')
            setParents(prev => prev.filter(p => p._id !== id))
        } catch { toast.error('Failed to delete parent') }
    }

    const filtered = parents.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Parents</h1>
                    <p className="text-muted-foreground">Register and manage parent accounts</p>
                </div>
                <div className="flex gap-3">
                    <PillButton variant="outline" onClick={() => router.push('/registry/link-accounts')}>
                        <LinkIcon className="h-4 w-4 mr-2" />Link Accounts
                    </PillButton>
                    <PillButton onClick={() => setIsRegistering(true)}><Plus className="h-4 w-4 mr-2" />Add Parent</PillButton>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle>All Parents <span className="text-muted-foreground text-sm font-normal ml-2">({filtered.length})</span></CardTitle>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name or email..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No parents found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map(p => (
                                <div key={p._id} className="p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                                                {p.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-foreground">{p.name}</p>
                                                <p className="text-xs text-muted-foreground">{p.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted transition-colors"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                                            <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded hover:bg-muted transition-colors"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">ID</span><span className="font-mono text-foreground">{p.id}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Status</span><span className="text-emerald-600 dark:text-emerald-400 font-medium">{p.status}</span></div>
                                    </div>
                                    <PillButton variant="outline" size="sm" fullWidth className="mt-3" onClick={() => router.push('/registry/link-accounts')}>
                                        <LinkIcon className="h-3.5 w-3.5 mr-1" />Link to Student
                                    </PillButton>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Register Dialog */}
            <Dialog open={isRegistering} onOpenChange={setIsRegistering}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Register New Parent</DialogTitle><DialogDescription>Creates a parent account. Temp password: TempPass123!</DialogDescription></DialogHeader>
                    <form onSubmit={handleRegister}>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>First Name <span className="text-destructive">*</span></Label><Input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} /></div>
                                <div className="space-y-2"><Label>Last Name <span className="text-destructive">*</span></Label><Input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} /></div>
                            </div>
                            <div className="space-y-2"><Label>Email <span className="text-destructive">*</span></Label><Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Phone Number</Label><Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+234..." /></div>
                        </div>
                        <DialogFooter>
                            <PillButton type="button" variant="outline" onClick={() => setIsRegistering(false)}>Cancel</PillButton>
                            <PillButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Registering...' : 'Register Parent'}</PillButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingParent} onOpenChange={v => !v && setEditingParent(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Parent</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>First Name</Label><Input value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Last Name</Label><Input value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} /></div>
                        </div>
                        <div className="space-y-2"><Label>Email</Label><Input value={editForm.email} disabled /></div>
                    </div>
                    <DialogFooter>
                        <PillButton variant="outline" onClick={() => setEditingParent(null)}>Cancel</PillButton>
                        <PillButton onClick={handleEdit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</PillButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
