'use client';

import { useState } from 'react';
import { EmployeeSidebar } from '@/components/employee/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { Plus, Loader2 } from 'lucide-react';

interface LeaveRecord {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function LeavePage() {
  const [showNewLeaveForm, setShowNewLeaveForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const { data, loading, error, fetch: refetch } = useFetch<{ leaves: LeaveRecord[] }>('/api/leave/request');

  const leaves = data?.leaves || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sick: 'Sick Leave',
      casual: 'Casual Leave',
      personal: 'Personal Leave',
      emergency: 'Emergency Leave',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      sick: 'bg-red-500/10 text-red-400 border-red-500/30',
      casual: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      personal: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      emergency: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      other: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    };
    return colors[type] || colors.other;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await window.fetch('/api/leave/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveType: formData.leaveType,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          reason: formData.reason,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setShowNewLeaveForm(false);
        setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
        refetch();
      } else {
        setSubmitError(result.error || 'Failed to submit leave request');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex">
      <EmployeeSidebar />
      <main className="flex-1 bg-background">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave Requests</h1>
            <p className="text-muted-foreground mt-1">Manage your leave requests.</p>
          </div>
          <button
            onClick={() => setShowNewLeaveForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            New Request
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Leave Requests */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error.message}</div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No leave requests yet. Click &quot;New Request&quot; to create one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map((request) => (
                <div key={request._id} className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLeaveTypeColor(request.leaveType)}`}>
                          {getLeaveTypeLabel(request.leaveType)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-muted-foreground text-xs">Start Date</p>
                          <p className="text-foreground font-medium">{new Date(request.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">End Date</p>
                          <p className="text-foreground font-medium">{new Date(request.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Days</p>
                          <p className="text-foreground font-medium">{request.numberOfDays} day(s)</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mt-3">
                        <strong>Reason:</strong> {request.reason}
                      </p>
                      <p className="text-muted-foreground text-xs mt-2">
                        Applied on {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Leave Form Modal */}
        {showNewLeaveForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-foreground mb-4">New Leave Request</h2>
              {submitError && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{submitError}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Leave Type</label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                    <option value="emergency">Emergency Leave</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Reason (min 10 characters)</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                    required
                    minLength={10}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    placeholder="Reason for leave..."
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewLeaveForm(false)}
                    className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                  >
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
