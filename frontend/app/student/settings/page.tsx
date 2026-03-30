'use client'

import { useState, useEffect } from 'react'
import { Bell, Lock, User, Globe, Moon, Monitor, Sun, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

export default function StudentSettingsPage() {
    const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' })
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isSavingPassword, setIsSavingPassword] = useState(false)

    useEffect(() => {
        const uStr = sessionStorage.getItem('user')
        if (uStr) {
            const u = JSON.parse(uStr)
            setProfile({
                firstName: u.firstName || '',
                lastName: u.lastName || '',
                email: u.email || u.username || '',
                phone: u.phone || ''
            })
        }
    }, [])

    const saveProfile = async () => {
        setIsSavingProfile(true)
        try {
            const uStr = sessionStorage.getItem('user')
            if (!uStr) return
            const u = JSON.parse(uStr)
            await apiFetch(`/users/${u._id || u.id}`, {
                method: 'PUT',
                body: JSON.stringify({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone })
            })
            const updated = { ...u, firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone }
            sessionStorage.setItem('user', JSON.stringify(updated))
            toast.success('Profile updated successfully')
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile')
        } finally {
            setIsSavingProfile(false)
        }
    }

    const savePassword = async () => {
        if (!passwords.current || !passwords.newPass) { toast.error('Please fill in all password fields'); return }
        if (passwords.newPass !== passwords.confirm) { toast.error('New passwords do not match'); return }
        if (passwords.newPass.length < 8) { toast.error('Password must be at least 8 characters'); return }
        setIsSavingPassword(true)
        try {
            await apiFetch('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass })
            })
            toast.success('Password changed successfully')
            setPasswords({ current: '', newPass: '', confirm: '' })
        } catch (err: any) {
            toast.error(err.message || 'Failed to change password')
        } finally {
            setIsSavingPassword(false)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and application settings</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" />Profile Information</CardTitle>
                        <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">First Name</label>
                                <Input value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Last Name</label>
                                <Input value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <Input value={profile.email} disabled />
                                <p className="text-xs text-muted-foreground">Contact IT services to change your academic email.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+234..." />
                            </div>
                        </div>
                        <PillButton className="mt-4" onClick={saveProfile} disabled={isSavingProfile}>
                            <Save className="h-4 w-4 mr-2" />{isSavingProfile ? 'Saving...' : 'Save Profile'}
                        </PillButton>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" />Change Password</CardTitle>
                        <CardDescription>Update your account password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Current Password</label>
                                <Input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} placeholder="Your current password" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">New Password</label>
                                <Input type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} placeholder="Min. 8 characters" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Confirm New Password</label>
                                <Input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" />
                            </div>
                        </div>
                        <PillButton className="mt-2" onClick={savePassword} disabled={isSavingPassword}>
                            {isSavingPassword ? 'Updating...' : 'Update Password'}
                        </PillButton>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" />Preferences</CardTitle>
                        <CardDescription>Customize your application experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="font-medium">Theme Appearance</h3>
                                <p className="text-sm text-muted-foreground">Switch between light, dark, or system theme</p>
                            </div>
                            <Select defaultValue="system">
                                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="w-4 h-4" />Light</div></SelectItem>
                                    <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="w-4 h-4" />Dark</div></SelectItem>
                                    <SelectItem value="system"><div className="flex items-center gap-2"><Monitor className="w-4 h-4" />System</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Notifications</CardTitle>
                        <CardDescription>Choose what updates you want to receive</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[
                            { label: 'New Grades', desc: 'Get notified when exams or assignments are graded', key: 'grades' },
                            { label: 'Attendance Updates', desc: 'Notifications when attendance is recorded', key: 'attendance' },
                            { label: 'New Messages', desc: 'Alerts for incoming messages from staff', key: 'messages' },
                        ].map(item => (
                            <div key={item.key} className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">{item.label}</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
