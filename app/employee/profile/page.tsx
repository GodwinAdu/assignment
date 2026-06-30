'use client';

import { useState, useEffect } from 'react';
import { EmployeeSidebar } from '@/components/employee/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { User, Mail, Phone, Briefcase, Calendar, Loader2 } from 'lucide-react';

interface ProfileData {
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    department: string;
    designation: string;
    createdAt: string;
  };
  attendance: any;
  leaves: any;
  performance: any;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const { data, loading, fetch: refetch } = useFetch<ProfileData>('/api/employee/profile');

  useEffect(() => {
    if (data?.user) {
      setFormData({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone || '',
      });
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await window.fetch('/api/employee/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update profile');
      
      const { toast } = await import('sonner');
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      refetch();
    } catch (err) {
      const { toast } = await import('sonner');
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (data?.user) {
      setFormData({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex">
        <EmployeeSidebar />
        <main className="flex-1 bg-background flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
      </div>
    );
  }

  const user = data?.user;

  return (
    <div className="flex">
      <EmployeeSidebar />
      <main className="flex-1 bg-background">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your profile information.</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-w-2xl">
          {/* Profile Header */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-muted-foreground">{user?.designation || 'Employee'}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  {user?.department || 'No department'}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 pb-4 border-b border-border">
              Personal Information
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <p className="px-3 py-2 text-foreground">{user?.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <p className="px-3 py-2 text-foreground">{user?.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="px-3 py-2 text-muted-foreground bg-secondary/30 rounded-lg">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                ) : (
                  <p className="px-3 py-2 text-foreground">{user?.phone || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 pb-4 border-b border-border">
              Work Information
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Department
                  </label>
                  <p className="px-3 py-2 text-foreground bg-secondary/30 rounded-lg">
                    {user?.department || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Designation</label>
                  <p className="px-3 py-2 text-foreground bg-secondary/30 rounded-lg">
                    {user?.designation || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Join Date
                </label>
                <p className="px-3 py-2 text-foreground bg-secondary/30 rounded-lg">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          {data?.performance && (
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 pb-4 border-b border-border">
                Performance Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Score</p>
                  <p className="text-2xl font-bold text-primary">{data.performance.score}%</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Rank</p>
                  <p className="text-2xl font-bold text-foreground">#{data.performance.rank || '-'}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Attendance</p>
                  <p className="text-2xl font-bold text-green-400">{data.performance.attendance}%</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Punctuality</p>
                  <p className="text-2xl font-bold text-blue-400">{data.performance.punctuality}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
