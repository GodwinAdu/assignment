'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { Header } from '@/components/Header';
import { useFetch } from '@/hooks/useFetch';
import { TrendingUp, Users, Calendar, TrendingDown, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalEmployees: number;
  todayAttendance: number;
  todayAbsent: number;
  pendingLeaves: number;
  attendanceRate: number;
  topPerformers: any[];
  departments: any[];
  attendanceTrend: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const { data, error, loading } = useFetch<AnalyticsData>('/api/analytics/overview');

  useEffect(() => {
    if (data) {
      setStats([
        {
          label: 'Total Employees',
          value: data.totalEmployees.toString(),
          icon: Users,
          trend: 'Active employees',
          trendUp: true,
        },
        {
          label: 'Present Today',
          value: data.todayAttendance.toString(),
          icon: Calendar,
          trend: `${data.todayAbsent} absent`,
          trendUp: true,
        },
        {
          label: 'Attendance Rate',
          value: `${data.attendanceRate.toFixed(1)}%`,
          icon: TrendingUp,
          trend: 'This month',
          trendUp: data.attendanceRate >= 85,
        },
        {
          label: 'Pending Leaves',
          value: data.pendingLeaves.toString(),
          icon: TrendingDown,
          trend: 'Awaiting approval',
          trendUp: false,
        },
      ]);
    }
  }, [data]);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-background min-h-screen">
        <Header 
          title="Dashboard" 
          subtitle="Welcome back! Here's your attendance overview."
        />

        {error && (
          <div className="mx-6 mt-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <p>{error.message}</p>
          </div>
        )}

        {loading ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded mt-2 w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                        <h2 className="text-3xl font-bold text-foreground mt-2">{stat.value}</h2>
                        <p
                          className={`text-sm mt-2 ${
                            stat.trendUp ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {stat.trend}
                        </p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Attendance Trend */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Attendance Trend (7 days)</h3>
                {data?.attendanceTrend && (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data.attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #444' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="present" stroke="#667eea" strokeWidth={2} />
                      <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Department Performance */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Employees by Department</h3>
                <div className="space-y-3">
                  {data?.departments?.slice(0, 5).map((dept) => (
                    <div key={dept._id} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{dept._id || 'Unassigned'}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(dept.count / (data.departments?.[0]?.count || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-fit">{dept.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performers */}
            {data?.topPerformers && data.topPerformers.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Top Performers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {data.topPerformers.map((performer, idx) => (
                    <div key={performer._id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-primary">#{idx + 1}</span>
                      </div>
                      <p className="font-medium text-sm text-foreground">
                        {performer.userId?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {performer.userId?.department || 'N/A'}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {performer.overallScore?.toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <a href="/admin/employees" className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-center">
                  Invite Employee
                </a>
                <a href="/admin/reports" className="px-4 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors text-center">
                  View Reports
                </a>
                <a href="/admin/leave" className="px-4 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors text-center">
                  Leave Approvals
                </a>
                <a href="/admin/settings" className="px-4 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors text-center">
                  Settings
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
