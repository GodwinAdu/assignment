'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { TablePageSkeleton } from '@/components/skeletons';
import { Plus, Search, Edit, UserX, UserCheck, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  phone?: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [inviteData, setInviteData] = useState({ email: '', firstName: '', lastName: '', department: '', designation: '' });
  const [editData, setEditData] = useState({ firstName: '', lastName: '', department: '', designation: '', phone: '' });

  const { data, loading, error, fetch: refetch } = useFetch<{ employees: Employee[] }>('/api/admin/employees');

  const employees = data?.employees || [];
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Invite employee
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const res = await window.fetch('/api/auth/invite-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to invite');
      toast.success('Invitation sent successfully!', { description: `An email has been sent to ${inviteData.email}` });
      setIsInviteModalOpen(false);
      setInviteData({ email: '', firstName: '', lastName: '', department: '', designation: '' });
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  // Open edit modal
  const handleEditClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department || '',
      designation: emp.designation || '',
      phone: emp.phone || '',
    });
    setIsEditModalOpen(true);
  };

  // Save edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setEditLoading(true);
    try {
      const res = await window.fetch('/api/admin/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: selectedEmployee.id, ...editData }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update');
      toast.success('Employee updated successfully!');
      setIsEditModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update employee');
    } finally {
      setEditLoading(false);
    }
  };

  // Toggle activate/deactivate
  const handleToggleStatus = async (emp: Employee) => {
    const action = emp.status === 'active' ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${emp.firstName} ${emp.lastName}?`)) return;

    try {
      const res = await window.fetch(`/api/admin/employees?id=${emp.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      toast.success(result.message || `Employee ${action}d`);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} employee`);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-background min-h-screen">
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
            <Plus className="w-5 h-5" /> Invite Employee
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{employees.length}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-green-400">Active</p>
              <p className="text-2xl font-bold text-foreground">{employees.filter(e => e.status === 'active').length}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400">Inactive</p>
              <p className="text-2xl font-bold text-foreground">{employees.filter(e => e.status === 'inactive').length}</p>
            </div>
          </div>

          {loading ? (
            <TablePageSkeleton />
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
                      <tr key={employee.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">{employee.firstName} {employee.lastName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">{employee.email}</td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">{employee.department || 'N/A'}</td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">{employee.designation || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            employee.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditClick(employee)}
                              className="p-2 hover:bg-secondary rounded-lg transition-colors"
                              title="Edit employee"
                            >
                              <Edit className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(employee)}
                              className="p-2 hover:bg-secondary rounded-lg transition-colors"
                              title={employee.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {employee.status === 'active' ? (
                                <UserX className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-muted-foreground hover:text-green-400" />
                              )}
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-foreground mb-4">Invite Employee</h2>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">First Name *</label>
                    <input type="text" required value={inviteData.firstName} onChange={(e) => setInviteData({ ...inviteData, firstName: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Last Name *</label>
                    <input type="text" required value={inviteData.lastName} onChange={(e) => setInviteData({ ...inviteData, lastName: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                  <input type="email" required value={inviteData.email} onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Department</label>
                  <input type="text" value={inviteData.department} onChange={(e) => setInviteData({ ...inviteData, department: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary" placeholder="Engineering" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Designation</label>
                  <input type="text" value={inviteData.designation} onChange={(e) => setInviteData({ ...inviteData, designation: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary" placeholder="Senior Developer" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={inviteLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
                    {inviteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button type="button" onClick={() => setIsInviteModalOpen(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-foreground mb-1">Edit Employee</h2>
              <p className="text-sm text-muted-foreground mb-4">{selectedEmployee.email}</p>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                    <input type="text" required value={editData.firstName} onChange={(e) => setEditData({ ...editData, firstName: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                    <input type="text" required value={editData.lastName} onChange={(e) => setEditData({ ...editData, lastName: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Department</label>
                  <input type="text" value={editData.department} onChange={(e) => setEditData({ ...editData, department: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Designation</label>
                  <input type="text" value={editData.designation} onChange={(e) => setEditData({ ...editData, designation: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                  <input type="text" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary" placeholder="+233..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={editLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
                    {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary">
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
