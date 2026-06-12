/**
 * Calculate performance score for an employee
 * Formula: (Attendance Rate × 0.4) + (Hours Worked Score × 0.4) + (Punctuality Score × 0.2)
 */

export interface PerformanceMetrics {
  attendanceRate: number; // 0-100
  hoursWorkedScore: number; // 0-100
  punctualityScore: number; // 0-100
  overallScore: number; // Final weighted score (0-100)
}

export interface EmployeePerformance {
  userId: string;
  employeeName: string;
  email: string;
  daysPresent: number;
  daysPresentOnTime: number;
  daysLate: number;
  daysAbsent: number;
  totalHoursWorked: number;
  expectedHours: number;
  metrics: PerformanceMetrics;
  rank?: number;
}

/**
 * Calculate attendance rate
 */
export function calculateAttendanceRate(daysPresent: number, totalDays: number = 20): number {
  if (totalDays === 0) return 0;
  return Math.round((daysPresent / totalDays) * 100);
}

/**
 * Calculate hours worked score
 * Compares actual hours worked to expected hours
 */
export function calculateHoursWorkedScore(
  actualHours: number,
  expectedHours: number = 160
): number {
  if (expectedHours === 0) return 0;
  const score = (actualHours / expectedHours) * 100;
  // Cap at 100, but allow overtime bonus up to 110
  return Math.min(score, 110);
}

/**
 * Calculate punctuality score
 * Based on number of days present on time vs late
 */
export function calculatePunctualityScore(
  daysOnTime: number,
  totalDaysPresent: number
): number {
  if (totalDaysPresent === 0) return 0;
  return Math.round((daysOnTime / totalDaysPresent) * 100);
}

/**
 * Calculate overall performance score
 * Weighted formula: (Attendance × 0.4) + (Hours × 0.4) + (Punctuality × 0.2)
 */
export function calculateOverallScore(metrics: Omit<PerformanceMetrics, 'overallScore'>): number {
  const score =
    metrics.attendanceRate * 0.4 +
    metrics.hoursWorkedScore * 0.4 +
    metrics.punctualityScore * 0.2;

  // Ensure score is between 0 and 100
  return Math.min(Math.max(Math.round(score), 0), 100);
}

/**
 * Get performance rating based on score
 */
export function getPerformanceRating(score: number): {
  rating: 'Excellent' | 'Good' | 'Average' | 'Poor';
  color: string;
} {
  if (score >= 90) {
    return { rating: 'Excellent', color: 'text-green-400' };
  } else if (score >= 75) {
    return { rating: 'Good', color: 'text-blue-400' };
  } else if (score >= 60) {
    return { rating: 'Average', color: 'text-yellow-400' };
  } else {
    return { rating: 'Poor', color: 'text-red-400' };
  }
}

/**
 * Calculate performance metrics for an employee
 */
export function calculateEmployeePerformance(
  data: Omit<EmployeePerformance, 'metrics' | 'rank'>
): EmployeePerformance {
  const attendanceRate = calculateAttendanceRate(
    data.daysPresent,
    data.daysPresent + data.daysAbsent
  );
  const hoursWorkedScore = calculateHoursWorkedScore(
    data.totalHoursWorked,
    data.expectedHours
  );
  const punctualityScore = calculatePunctualityScore(
    data.daysPresentOnTime,
    data.daysPresent
  );
  const overallScore = calculateOverallScore({
    attendanceRate,
    hoursWorkedScore,
    punctualityScore,
  });

  return {
    ...data,
    metrics: {
      attendanceRate,
      hoursWorkedScore,
      punctualityScore,
      overallScore,
    },
  };
}

/**
 * Rank employees based on overall score
 */
export function rankEmployees(employees: EmployeePerformance[]): EmployeePerformance[] {
  return employees
    .sort((a, b) => b.metrics.overallScore - a.metrics.overallScore)
    .map((emp, index) => ({
      ...emp,
      rank: index + 1,
    }));
}
