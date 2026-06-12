'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { Calendar, Download, Filter } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  employeeName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: string;
  hoursWorked: number;
}

interface AttendanceData {
  records: AttendanceRecord[];
  summary: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data, loading, error, fetch: refetch } = useFetch<AttendanceData>(
    `/api/admin/attendance?date=${selectedDate}&status=${selectedStatus}`
  );

  useEffect(() => {
    refetch();
  }, [selectedDate, selectedStatus]);

  const records = data?.records || [];
  const summary = data?.summary || { present: 0, absent: 0, late: 0, total: 0 };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500/20 text-green-400';
      case 'absent': return 'bg-red-500/20 text-red-400';
      case 'late': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleExport = async () => {
    try {
      const res = await window.fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'excel' }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${selectedDate}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-background">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground mt-1">View and manage employee attendance records.</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-border bg-secondary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status Filter</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => refetch()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
              >
                <Filter className="w-4 h-4" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm font-medium text-green-400">Present</p>
              <p className="text-2xl font-bold text-foreground mt-1">{summary.present}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm font-medium text-red-400">Absent</p>
              <p className="text-2xl font-bold text-foreground mt-1">{summary.absent}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-400">Late</p>
              <p className="text-2xl font-bold text-foreground mt-1">{summary.late}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-400">Total</p>
              <p className="text-2xl font-bold text-foreground mt-1">{summary.total}</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
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
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Employee</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Check-In</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Check-Out</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Hours</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 text-foreground font-medium">{record.employeeName}</td>
                        <td className="px-6 py-4 text-muted-foreground">{record.checkInTime}</td>
                        <td className="px-6 py-4 text-muted-foreground">{record.checkOutTime}</td>
                        <td className="px-6 py-4 text-muted-foreground">{record.hoursWorked.toFixed(1)}h</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {records.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">No attendance records found for this date.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
