'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { Plus, Search, Edit, Trash2, Mail } from 'lucide-react';

interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteData, setInviteData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    designation: '',
  });

  const { data, loading, error, fetch: refetch } = useFetch<{ employees: Employee[] }>('/api/admin/employees');

  const employees = data?.employees || [];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError('');

    try {
      const res = await window.fetch('/api/auth/invite-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to invite');

      setIsInviteModalOpen(false);
      setInviteData({ email: '', firstName: '', lastName: '', department: '', designation: '' });
      refetch();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-background">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground mt-1">Manage your team members and their information.</p>
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Invite Employee
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error.message}</div>
          ) : (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-secondary/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Department</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Designation</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-b border-border hover:bg-secondary/20 transition-colors"
                      >
                        <td className="px-6 py-4 text-foreground font-medium">
                          {employee.firstName} {employee.lastName}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{employee.email}</td>
                        <td className="px-6 py-4 text-muted-foreground">{employee.department || 'N/A'}</td>
                        <td className="px-6 py-4 text-muted-foreground">{employee.designation || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              employee.status === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {employee.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-secondary rounded transition-colors" title="Send email">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button className="p-2 hover:bg-secondary rounded transition-colors" title="Edit">
                              <Edit className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button className="p-2 hover:bg-secondary rounded transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEmployees.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No employees found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Invite Modal */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-foreground mb-4">Invite Employee</h2>
              {inviteError && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{inviteError}</div>
              )}
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                  <input type="text" required value={inviteData.firstName} onChange={(e) => setInviteData({ ...inviteData, firstName: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                  <input type="text" required value={inviteData.lastName} onChange={(e) => setInviteData({ ...inviteData, lastName: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary" placeholder="Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input type="email" required value={inviteData.email} onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary" placeholder="john.doe@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Department</label>
                  <input type="text" value={inviteData.department} onChange={(e) => setInviteData({ ...inviteData, department: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary" placeholder="Engineering" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Designation</label>
                  <input type="text" value={inviteData.designation} onChange={(e) => setInviteData({ ...inviteData, designation: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary" placeholder="Senior Developer" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={inviteLoading} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button type="button" onClick={() => setIsInviteModalOpen(false)} className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
