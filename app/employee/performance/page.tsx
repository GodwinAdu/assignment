'use client';

import { EmployeeSidebar } from '@/components/employee/Sidebar';
import { Header } from '@/components/Header';
import { useFetch } from '@/hooks/useFetch';
import { TrendingUp, Award, Target, Clock, Loader2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function EmployeePerformancePage() {
  const { data, loading } = useFetch<any>('/api/employee/dashboard');

  const performance = data?.performance;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRating = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  const radarData = performance ? [
    { metric: 'Attendance Rate', value: performance.attendanceRate, fullMark: 100 },
    { metric: 'Hours Worked', value: performance.hoursWorkedScore, fullMark: 100 },
    { metric: 'Punctuality', value: performance.punctualityScore, fullMark: 100 },
  ] : [];

  const kpis = performance ? [
    { name: 'Attendance Rate', score: performance.attendanceRate, weight: '40%', icon: Target, desc: 'Days present vs total working days' },
    { name: 'Hours Worked Score', score: performance.hoursWorkedScore, weight: '40%', icon: Clock, desc: 'Actual hours vs expected hours' },
    { name: 'Punctuality Score', score: performance.punctualityScore, weight: '20%', icon: TrendingUp, desc: 'Days on time vs total days present' },
  ] : [];

  return (
    <div className="flex">
      <EmployeeSidebar />
      <main className="flex-1 bg-background min-h-screen">
        <Header title="My Performance" subtitle="View your performance metrics and scores." />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {performance ? (
              <>
                {/* Overall Score */}
                <div className="bg-card rounded-lg border border-border p-6 text-center">
                  <Award className="w-12 h-12 text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Overall Performance Score</p>
                  <p className={`text-5xl font-bold mt-2 ${getScoreColor(performance.overallScore)}`}>
                    {performance.overallScore}%
                  </p>
                  <p className={`text-lg font-medium mt-2 ${getScoreColor(performance.overallScore)}`}>
                    {getRating(performance.overallScore)}
                  </p>
                  {performance.rank && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Rank: <span className="font-bold text-primary">#{performance.rank}</span> in company
                    </p>
                  )}
                </div>

                {/* Radar Chart + KPI Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Score Breakdown</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
                        <Radar name="Score" dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.25} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    {kpis.map((kpi) => {
                      const Icon = kpi.icon;
                      return (
                        <div key={kpi.name} className="bg-card rounded-lg border border-border p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{kpi.name}</p>
                                <p className="text-xs text-muted-foreground">{kpi.desc}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-bold ${getScoreColor(kpi.score)}`}>{kpi.score}%</p>
                              <p className="text-xs text-muted-foreground">Weight: {kpi.weight}</p>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${kpi.score}%`,
                                backgroundColor: kpi.score >= 90 ? '#22c55e' : kpi.score >= 75 ? '#3b82f6' : kpi.score >= 60 ? '#f59e0b' : '#ef4444',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scoring formula explanation */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">How Your Score is Calculated</h3>
                  <div className="bg-secondary/30 rounded-lg p-4 font-mono text-sm">
                    <p className="text-primary">Overall Score = (Attendance Rate × 0.4) + (Hours Worked Score × 0.4) + (Punctuality Score × 0.2)</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-sm">
                      <p className="font-medium text-foreground">Attendance Rate</p>
                      <p className="text-muted-foreground">Days Present ÷ Total Working Days × 100</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground">Hours Worked Score</p>
                      <p className="text-muted-foreground">Actual Hours ÷ Expected Hours × 100</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground">Punctuality Score</p>
                      <p className="text-muted-foreground">Days On Time ÷ Days Present × 100</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-card rounded-lg border border-border p-12 text-center">
                <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Performance Data Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your performance score will be calculated once you have enough attendance records.
                  Keep checking in on time to build your score!
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
