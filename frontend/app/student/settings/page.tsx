'use client'

import { Bell, Lock, User, Globe, Moon, Monitor, Sun } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PillButton } from '@/components/ui/pill-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export default function StudentSettingsPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
                    Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your account preferences and application settings
                </p>
            </div>

            <div className="grid gap-6">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">First Name</label>
                                <Input defaultValue="Emma" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Last Name</label>
                                <Input defaultValue="Smith" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <Input defaultValue="emma.smith@university.edu" disabled />
                                <p className="text-xs text-muted-foreground">Contact IT services to change your academic email.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input defaultValue="+1 (555) 123-4567" />
                            </div>
                        </div>
                        <PillButton className="mt-4">Save Profile</PillButton>
                    </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            Preferences
                        </CardTitle>
                        <CardDescription>Customize your application experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="font-medium">Theme Appearance</h3>
                                <p className="text-sm text-muted-foreground">Switch between light, dark, or system theme</p>
                            </div>
                            <Select defaultValue="system">
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="w-4 h-4" />Light</div></SelectItem>
                                    <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="w-4 h-4" />Dark</div></SelectItem>
                                    <SelectItem value="system"><div className="flex items-center gap-2"><Monitor className="w-4 h-4" />System</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="font-medium">Language</h3>
                                <p className="text-sm text-muted-foreground">Select your preferred system language</p>
                            </div>
                            <Select defaultValue="en">
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Español</SelectItem>
                                    <SelectItem value="fr">Français</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Choose what updates you want to receive</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="font-medium">New Grades</h3>
                                <p className="text-sm text-muted-foreground">Get notified when exams or assignments are graded</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="font-medium">Direct Messages</h3>
                                <p className="text-sm text-muted-foreground">Receive push notifications for messages from lecturers</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="font-medium">Course Announcements</h3>
                                <p className="text-sm text-muted-foreground">Alerts for schedule changes and materials</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            Security
                        </CardTitle>
                        <CardDescription>Keep your account secure</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Password</h3>
                                <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                            </div>
                            <PillButton variant="outline">Update Password</PillButton>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Two-Factor Authentication</h3>
                                <p className="text-sm text-muted-foreground">Adds an extra layer of security</p>
                            </div>
                            <PillButton variant="outline">Enable 2FA</PillButton>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
