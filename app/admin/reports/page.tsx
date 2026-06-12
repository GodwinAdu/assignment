'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { ReportsSkeleton } from '@/components/skeletons';
import { Download, Printer, TrendingUp, Users, Clock, Calendar, Trophy, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

interface ReportData {
  month: string;
  monthLabel: string;
  summary: {
    totalEmployees: number;
    totalRecords: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    onLeave: number;
    totalHours: number;
    avgDailyHours: string;
  };
  attendanceBreakdown: { present: number; late: number; absent: number; onLeave: number };
  departmentData: Array<{ department: string; employees: number; records: number; hours: number; attendanceRate: number }>;
  leaveSummary: { approved: number; pending: number; rejected: number };
  topPerformers: Array<{ name: string; department: string; score: number; rank: number }>;
}

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [generating, setGenerating] = useState<string | null>(null);

  const { data, loading, fetch: refetch } = useFetch<ReportData>(
    `/api/admin/reports?month=${selectedMonth}`
  );

  useEffect(() => {
    refetch();
  }, [selectedMonth]);

  const handleExport = async (type: 'pdf' | 'excel') => {
    setGenerating(type);
    try {
      const res = await window.fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, month: selectedMonth }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${selectedMonth}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`${type.toUpperCase()} report downloaded`, {
          description: `Report for ${selectedMonth}`,
        });
      } else {
        toast.error('Export failed', { description: 'Please try again.' });
      }
    } catch (err) {
      toast.error('Export failed', { description: 'Network error.' });
    } finally {
      setGenerating(null);
    }
  };

  const pieData = data ? [
    { name: 'Present', value: data.attendanceBreakdown.present },
    { name: 'Late', value: data.attendanceBreakdown.late },
    { name: 'Absent', value: data.attendanceBreakdown.absent },
    { name: 'On Leave', value: data.attendanceBreakdown.onLeave },
  ] : [];

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-background min-h-screen">
        {/* Header with controls */}
        <div className="border-b border-border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Monthly Report</h1>
              <p className="text-muted-foreground mt-1">Comprehensive attendance and performance analysis.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => handleExport('pdf')}
                disabled={generating === 'pdf'}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary disabled:opacity-50"
              >
                {generating === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={generating === 'excel'}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary disabled:opacity-50"
              >
                {generating === 'excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Excel
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <ReportsSkeleton />
        ) : data ? (
          <div className="p-6 space-y-6 print:p-2">
            {/* Report title */}
            <div className="text-center py-4 print:py-2">
              <h2 className="text-2xl font-bold text-foreground">{data.monthLabel} — Monthly Report</h2>
              <p className="text-sm text-muted-foreground mt-1">Generated on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Present Days', value: data.summary.presentDays, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Late Days', value: data.summary.lateDays, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { label: 'Absent Days', value: data.summary.absentDays, color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: 'On Leave', value: data.summary.onLeave, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Total Hours', value: `${data.summary.totalHours}h`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { label: 'Avg Daily Hours', value: `${data.summary.avgDailyHours}h`, color: 'text-primary', bg: 'bg-primary/10' },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} rounded-lg border border-border p-4`}>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart - Attendance Breakdown */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Attendance Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart - Department Attendance Rate */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Department Attendance Rate</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="department" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                    <Bar dataKey="attendanceRate" fill="#667eea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Department Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Employees</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Total Hours</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.departmentData.map((dept) => (
                      <tr key={dept.department} className="border-b border-border">
                        <td className="px-6 py-3 font-medium">{dept.department}</td>
                        <td className="px-6 py-3 text-muted-foreground">{dept.employees}</td>
                        <td className="px-6 py-3 text-muted-foreground">{dept.hours}h</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[120px]">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${dept.attendanceRate}%`,
                                  backgroundColor: dept.attendanceRate >= 80 ? '#22c55e' : dept.attendanceRate >= 60 ? '#f59e0b' : '#ef4444',
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">{dept.attendanceRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leave Summary */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Leave Summary</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{data.leaveSummary.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-400">{data.leaveSummary.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-400">{data.leaveSummary.rejected}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            {data.topPerformers.length > 0 && (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-foreground">Performance Ranking — {data.monthLabel}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/30 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Employee</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topPerformers.map((perf) => (
                        <tr key={perf.rank} className="border-b border-border hover:bg-secondary/20">
                          <td className="px-6 py-3">
                            {perf.rank <= 3 ? (
                              <span className="text-lg">{['🥇', '🥈', '🥉'][perf.rank - 1]}</span>
                            ) : (
                              <span className="text-muted-foreground">#{perf.rank}</span>
                            )}
                          </td>
                          <td className="px-6 py-3 font-medium">{perf.name}</td>
                          <td className="px-6 py-3 text-muted-foreground">{perf.department}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[120px]">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${perf.score}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-primary">{perf.score}/100</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
