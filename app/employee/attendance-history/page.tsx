'use client';

import { useState, useEffect } from 'react';
import { EmployeeSidebar } from '@/components/employee/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { TablePageSkeleton } from '@/components/skeletons';
import { Download, Calendar, Loader2 } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: string;
}

interface AttendanceData {
  records: AttendanceRecord[];
  stats: {
    daysPresent: number;
    daysAbsent: number;
    daysLate: number;
    avgHours: string;
    totalRecords: number;
  };
}

export default function AttendanceHistoryPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

  const { data, loading, error, fetch: refetch } = useFetch<AttendanceData>(
    `/api/employee/attendance?month=${selectedMonth}`
  );

  useEffect(() => {
    refetch();
  }, [selectedMonth]);

  const records = data?.records || [];
  const stats = data?.stats || { daysPresent: 0, daysAbsent: 0, daysLate: 0, avgHours: '0', totalRecords: 0 };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500/20 text-green-400';
      case 'absent': return 'bg-red-500/20 text-red-400';
      case 'late': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="flex">
      <EmployeeSidebar />
      <main className="flex-1 bg-background">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
            <p className="text-muted-foreground mt-1">View your attendance history and records.</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Month Selector */}
          <div className="flex gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-muted-foreground text-sm mb-1">Days Present</p>
              <p className="text-3xl font-bold text-green-400">{stats.daysPresent}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-muted-foreground text-sm mb-1">Days Absent</p>
              <p className="text-3xl font-bold text-red-400">{stats.daysAbsent}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-muted-foreground text-sm mb-1">Days Late</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.daysLate}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-muted-foreground text-sm mb-1">Avg Hours/Day</p>
              <p className="text-3xl font-bold text-primary">{stats.avgHours}h</p>
            </div>
          </div>

          {/* Attendance Table */}
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
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Day</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Check-In</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Check-Out</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Hours</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 text-foreground font-medium">{record.date}</td>
                        <td className="px-6 py-4 text-muted-foreground">{record.day}</td>
                        <td className="px-6 py-4 text-muted-foreground">{record.checkIn}</td>
                        <td className="px-6 py-4 text-muted-foreground">{record.checkOut}</td>
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
                    <p className="text-muted-foreground">No attendance records for this month.</p>
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
