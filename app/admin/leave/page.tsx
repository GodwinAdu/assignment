'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { Calendar, CheckCircle, XCircle, Clock, Filter, MessageSquare } from 'lucide-react';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
}

interface LeaveData {
  leaves: LeaveRequest[];
  counts: { all: number; pending: number; approved: number; rejected: number };
}

export default function AdminLeavePage() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');

  const { data, loading, fetch: refetch } = useFetch<LeaveData>(
    `/api/admin/leave?status=${statusFilter}`
  );

  useEffect(() => {
    refetch();
  }, [statusFilter]);

  const leaves = data?.leaves || [];
  const counts = data?.counts || { all: 0, pending: 0, approved: 0, rejected: 0 };

  const openModal = (leave: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setModalAction(action);
    setAdminNotes('');
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedLeave) return;
    setProcessing(true);

    try {
      const res = await window.fetch('/api/admin/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId: selectedLeave.id,
          action: modalAction,
          adminNotes,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        refetch();
      }
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'sick': return 'bg-red-500/10 text-red-400';
      case 'casual': return 'bg-blue-500/10 text-blue-400';
      case 'personal': return 'bg-purple-500/10 text-purple-400';
      case 'emergency': return 'bg-orange-500/10 text-orange-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-background min-h-screen">
        {/* Header */}
        <div className="border-b border-border p-6">
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1">Approve or reject employee leave requests.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Status filter tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'pending', label: 'Pending', count: counts.pending, color: 'border-yellow-500/50 bg-yellow-500/5' },
              { key: 'approved', label: 'Approved', count: counts.approved, color: 'border-green-500/50 bg-green-500/5' },
              { key: 'rejected', label: 'Rejected', count: counts.rejected, color: 'border-red-500/50 bg-red-500/5' },
              { key: 'all', label: 'All', count: counts.all, color: 'border-blue-500/50 bg-blue-500/5' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  statusFilter === tab.key
                    ? tab.color + ' ring-1 ring-primary/50'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <p className="text-sm text-muted-foreground">{tab.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{tab.count}</p>
              </button>
            ))}
          </div>

          {/* Leave requests table */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-secondary/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Employee</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Dates</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Days</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Reason</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{leave.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{leave.department}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${getLeaveTypeColor(leave.leaveType)}`}>
                            {leave.leaveType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(leave.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {' – '}
                          {new Date(leave.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-medium">{leave.numberOfDays}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground max-w-[200px] truncate">
                          {leave.reason}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {leave.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => openModal(leave, 'approve')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => openModal(leave, 'reject')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {leave.rejectionReason || '–'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {leaves.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">No leave requests found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Approve/Reject Modal */}
        {showModal && selectedLeave && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg w-full max-w-md mx-4 p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {modalAction === 'approve' ? '✅ Approve Leave' : '❌ Reject Leave'}
              </h2>

              <div className="bg-secondary/30 rounded-lg p-4 mb-4">
                <p className="font-medium text-foreground">{selectedLeave.employeeName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedLeave.leaveType} leave · {selectedLeave.numberOfDays} days
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedLeave.startDate).toLocaleDateString()} – {new Date(selectedLeave.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Admin Notes (optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Reason for decision..."
                  rows={3}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={processing}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    modalAction === 'approve'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {processing ? 'Processing...' : modalAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
