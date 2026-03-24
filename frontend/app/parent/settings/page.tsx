'use client'

import { useState } from 'react'
import { User, Bell, Lock, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PillButton } from '@/components/ui/pill-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

export default function ParentSettingsPage() {
  const [settings, setSettings] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    relationship: 'Mother',
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    gradeUpdates: true,
    attendanceAlerts: true,
    disciplineNotices: true,
    eventReminders: true,
    weeklyReports: false,
  })

  const [linkedStudents, setLinkedStudents] = useState([
    { id: '1', name: 'Emma Smith', grade: '10' },
  ])

  const [showAddChild, setShowAddChild] = useState(false)

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={settings.firstName}
                onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={settings.lastName}
                onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="relationship">Relationship to Student</Label>
            <Input
              id="relationship"
              value={settings.relationship}
              onChange={(e) => setSettings({ ...settings, relationship: e.target.value })}
            />
          </div>
          <PillButton>Save Changes</PillButton>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose what notifications you'd like to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="emailNotifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, emailNotifications: checked as boolean })
                }
              />
              <Label htmlFor="emailNotifications" className="flex-1 cursor-pointer">
                Email Notifications
              </Label>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="gradeUpdates"
                checked={preferences.gradeUpdates}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, gradeUpdates: checked as boolean })
                }
              />
              <Label htmlFor="gradeUpdates" className="flex-1 cursor-pointer">
                New Grade Updates
              </Label>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="attendanceAlerts"
                checked={preferences.attendanceAlerts}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, attendanceAlerts: checked as boolean })
                }
              />
              <Label htmlFor="attendanceAlerts" className="flex-1 cursor-pointer">
                Attendance Alerts
              </Label>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="disciplineNotices"
                checked={preferences.disciplineNotices}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, disciplineNotices: checked as boolean })
                }
              />
              <Label htmlFor="disciplineNotices" className="flex-1 cursor-pointer">
                Discipline Notices
              </Label>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="eventReminders"
                checked={preferences.eventReminders}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, eventReminders: checked as boolean })
                }
              />
              <Label htmlFor="eventReminders" className="flex-1 cursor-pointer">
                Event Reminders
              </Label>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="weeklyReports"
                checked={preferences.weeklyReports}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, weeklyReports: checked as boolean })
                }
              />
              <Label htmlFor="weeklyReports" className="flex-1 cursor-pointer">
                Weekly Summary Reports
              </Label>
            </div>
          </div>
          <PillButton>Save Preferences</PillButton>
        </CardContent>
      </Card>

      {/* Linked Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Linked Children
          </CardTitle>
          <CardDescription>Students you can view information for</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {linkedStudents.map((student) => (
              <div key={student.id} className="p-3 rounded-lg border border-border flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">Grade {student.grade}</p>
                </div>
                <PillButton size="sm" variant="ghost">
                  Manage
                </PillButton>
              </div>
            ))}
          </div>
          <PillButton variant="secondary" fullWidth>
            Add Another Child
          </PillButton>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PillButton variant="outline" fullWidth>
            Change Password
          </PillButton>
          <PillButton variant="outline" fullWidth>
            Two-Factor Authentication
          </PillButton>
          <PillButton variant="outline" fullWidth>
            Active Sessions
          </PillButton>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Account Actions</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <PillButton variant="outline" fullWidth className="text-muted-foreground">
            Download My Data
          </PillButton>
          <PillButton
            variant="destructive"
            fullWidth
            className="border-destructive/50"
          >
            Delete Account
          </PillButton>
        </CardContent>
      </Card>
    </div>
  )
}
