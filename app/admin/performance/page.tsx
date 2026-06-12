'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { TablePageSkeleton } from '@/components/skeletons';
import { Trophy, TrendingUp, Award, BarChart3 } from 'lucide-react';

interface PerformanceEmployee {
  userId: string;
  employeeName: string;
  email: string;
  department: string;
  daysPresent: number;
  daysPresentOnTime: number;
  daysLate: number;
  daysAbsent: number;
  totalHoursWorked: number;
  expectedHours: number;
  metrics: {
    attendanceRate: number;
    hoursWorkedScore: number;
    punctualityScore: number;
    overallScore: number;
  };
  rank: number;
}

interface PerformanceData {
  employees: PerformanceEmployee[];
  averages: {
    score: number;
    attendance: number;
    punctuality: number;
  };
}

export default function PerformancePage() {
  const [sortBy, setSortBy] = useState<'score' | 'attendance' | 'punctuality'>('score');

  const { data, loading, error } = useFetch<PerformanceData>('/api/admin/performance');

  const employees = data?.employees || [];
  const avgPerformance = data?.averages || { score: 0, attendance: 0, punctuality: 0 };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/20';
    if (score >= 75) return 'bg-blue-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const sortedData = [...employees].sort((a, b) => {
    switch (sortBy) {
      case 'attendance': return b.metrics.attendanceRate - a.metrics.attendanceRate;
      case 'punctuality': return b.metrics.punctualityScore - a.metrics.punctualityScore;
      default: return b.metrics.overallScore - a.metrics.overallScore;
    }
  });

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-background">
        {/* Header */}
        <div className="border-b border-border p-6">
          <h1 className="text-3xl font-bold text-foreground">Performance Analytics</h1>
          <p className="text-muted-foreground mt-1">Track employee performance metrics and rankings.</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Avg Performance Score</p>
                  <p className={`text-4xl font-bold mt-2 ${getScoreColor(avgPerformance.score)}`}>
                    {avgPerformance.score}%
                  </p>
                </div>
                <Award className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Avg Attendance Rate</p>
                  <p className="text-4xl font-bold mt-2 text-green-400">{avgPerformance.attendance}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Avg Punctuality</p>
                  <p className="text-4xl font-bold mt-2 text-blue-400">{avgPerformance.punctuality}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Sorting */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'attendance' | 'punctuality')}
                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              >
                <option value="score">Overall Score</option>
                <option value="attendance">Attendance Rate</option>
                <option value="punctuality">Punctuality</option>
              </select>
            </div>
          </div>

          {loading ? (
            <TablePageSkeleton />
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error.message}</div>
          ) : (
            <>
              {/* Top Performers */}
              {sortedData.length > 0 && (
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="p-6 border-b border-border flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-lg font-semibold text-foreground">Top Performers</h2>
                  </div>
                  <div className="divide-y divide-border">
                    {sortedData.slice(0, 3).map((emp, idx) => (
                      <div key={emp.userId} className="p-4 hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-muted-foreground w-8">
                            {['🥇', '🥈', '🥉'][idx]}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{emp.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{emp.email}</p>
                          </div>
                          <div className={`px-4 py-2 rounded-lg font-bold ${getScoreBgColor(emp.metrics.overallScore)} ${getScoreColor(emp.metrics.overallScore)}`}>
                            {emp.metrics.overallScore}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Table */}
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-secondary/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Rank</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Employee</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Overall Score</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Attendance</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Hours Worked</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Punctuality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((emp) => (
                        <tr key={emp.userId} className="border-b border-border hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-muted-foreground font-medium">#{emp.rank}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-foreground">{emp.employeeName}</p>
                              <p className="text-sm text-muted-foreground">{emp.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-block px-3 py-1 rounded font-bold ${getScoreBgColor(emp.metrics.overallScore)} ${getScoreColor(emp.metrics.overallScore)}`}>
                              {emp.metrics.overallScore}%
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-foreground">{emp.metrics.attendanceRate}%</p>
                              <p className="text-xs text-muted-foreground">{emp.daysPresent} days present</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-foreground">{emp.metrics.hoursWorkedScore}%</p>
                              <p className="text-xs text-muted-foreground">{emp.totalHoursWorked}h worked</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-foreground">{emp.metrics.punctualityScore}%</p>
                              <p className="text-xs text-muted-foreground">{emp.daysLate} days late</p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sortedData.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No performance data available yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
