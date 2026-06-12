    'use client';

import { useEffect, useState } from 'react';
import { EmployeeSidebar } from '@/components/employee/Sidebar';
import { Header } from '@/components/Header';
import { useFetch } from '@/hooks/useFetch';
import { DashboardSkeleton } from '@/components/skeletons';
import { Clock, CheckCircle, AlertCircle, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast } from 'sonner';

export default function EmployeeDashboard() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [checking, setChecking] = useState<'in' | 'out' | null>(null);

  const { data, loading, fetch: refetch } = useFetch<any>('/api/employee/dashboard');

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB'));
      setCurrentDate(now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    setChecking('in');
    try {
      const res = await window.fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkInMethod: 'manual' }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.isLate ? 'Checked in (marked as late)' : 'Check-in successful!', {
          description: `Time: ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
        });
        refetch();
      } else {
        toast.error('Check-in failed', { description: result.error });
      }
    } catch (err) {
      toast.error('Network error', { description: 'Please try again.' });
    } finally {
      setChecking(null);
    }
  };

  const handleCheckOut = async () => {
    setChecking('out');
    try {
      const res = await window.fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success('Check-out successful!', {
          description: `Hours worked: ${result.hoursWorked?.toFixed(1)}h`,
        });
        refetch();
      } else {
        toast.error('Check-out failed', { description: result.error });
      }
    } catch (err) {
      toast.error('Network error', { description: 'Please try again.' });
    } finally {
      setChecking(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-green-500/20 text-green-400',
      late: 'bg-yellow-500/20 text-yellow-400',
      absent: 'bg-red-500/20 text-red-400',
      leave: 'bg-blue-500/20 text-blue-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const radarData = data?.performance ? [
    { metric: 'Attendance', value: data.performance.attendanceRate },
    { metric: 'Hours Worked', value: data.performance.hoursWorkedScore },
    { metric: 'Punctuality', value: data.performance.punctualityScore },
  ] : [];

  return (
    <div className="flex">
      <EmployeeSidebar />
      <main className="flex-1 bg-background min-h-screen">
        <Header title="My Dashboard" subtitle={`Welcome back, ${data?.user?.name || ''}!`} />

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="p-6 space-y-6">
            {/* Check-in Panel */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-4xl font-mono font-bold text-foreground">{currentTime}</p>
                  <p className="text-muted-foreground mt-1">{currentDate}</p>
                  {data?.today && (
                    <div className="flex gap-4 mt-2">
                      {data.today.checkInTime && (
                        <span className="text-sm text-muted-foreground">
                          In: <strong className="text-primary">{new Date(data.today.checkInTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</strong>
                        </span>
                      )}
                      {data.today.checkOutTime && (
                        <span className="text-sm text-muted-foreground">
                          Out: <strong className="text-primary">{new Date(data.today.checkOutTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</strong>
                        </span>
                      )}
                      {data.today.hoursWorked > 0 && (
                        <span className="text-sm text-muted-foreground">
                          Hours: <strong className="text-green-400">{data.today.hoursWorked.toFixed(1)}h</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCheckIn}
                    disabled={!!data?.today?.checkInTime || checking === 'in'}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {checking === 'in' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Check In
                  </button>
                  <button
                    onClick={handleCheckOut}
                    disabled={!data?.today?.checkInTime || !!data?.today?.checkOutTime || checking === 'out'}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {checking === 'out' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                    Check Out
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-400 font-medium">Present (Month)</p>
                <p className="text-3xl font-bold text-foreground mt-1">{data?.monthlyStats?.present || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">out of {data?.monthlyStats?.totalDays || 0} days</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-400 font-medium">Late Arrivals</p>
                <p className="text-3xl font-bold text-foreground mt-1">{data?.monthlyStats?.late || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">this month</p>
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-sm text-primary font-medium">Total Hours</p>
                <p className="text-3xl font-bold text-foreground mt-1">{data?.monthlyStats?.totalHours || 0}<span className="text-lg">h</span></p>
                <p className="text-xs text-muted-foreground mt-1">this month</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-400 font-medium">Pending Leave</p>
                <p className="text-3xl font-bold text-foreground mt-1">{data?.pendingLeaves || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <a href="/employee/leave" className="text-primary hover:underline">view requests →</a>
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Hours Bar Chart */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Hours</h3>
                {data?.weekData && (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.weekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 12]} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                      <Bar
                        dataKey="hours"
                        fill="#667eea"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* KPI Radar Chart */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Performance Score
                  {data?.performance?.overallScore !== undefined && (
                    <span className="ml-2 text-primary">{data.performance.overallScore}%</span>
                  )}
                </h3>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
                      <Radar name="Score" dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[220px] text-muted-foreground">
                    <p>No performance data yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Attendance Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Recent Attendance</h3>
                <a href="/employee/attendance-history" className="text-sm text-primary hover:underline">View All</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Check In</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Check Out</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Hours</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentAttendance?.map((record: any, idx: number) => (
                      <tr key={idx} className="border-b border-border">
                        <td className="px-6 py-3 text-sm">
                          {new Date(record.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '–'}
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '–'}
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {record.hours > 0 ? `${record.hours.toFixed(1)}h` : '–'}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${getStatusBadge(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!data?.recentAttendance || data.recentAttendance.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          No attendance records yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
