import { Skeleton } from '@/components/ui/skeleton';

// Dashboard skeleton with stats, charts, table
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Table page skeleton (attendance, employees, leave)
export function TablePageSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Filter bar */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-7 w-10" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border p-4 bg-secondary/30">
          <div className="flex gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="p-4 flex items-center gap-6">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Settings page skeleton
export function SettingsSkeleton() {
  return (
    <div className="p-6 max-w-4xl space-y-6 animate-in fade-in duration-300">
      {[1, 2, 3, 4].map((section) => (
        <div key={section} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="space-y-4">
            {[1, 2].map((field) => (
              <div key={field}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}

// Reports page skeleton
export function ReportsSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center py-4">
        <Skeleton className="h-7 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-5 w-48 mb-4" />
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <Skeleton className="h-5 w-36 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-24 rounded-full" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Performance page skeleton
export function PerformanceSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Score card */}
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto mb-3" />
        <Skeleton className="h-4 w-40 mx-auto mb-2" />
        <Skeleton className="h-12 w-20 mx-auto mb-2" />
        <Skeleton className="h-5 w-24 mx-auto" />
      </div>

      {/* Charts + KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// QR page skeleton
export function QRPageSkeleton() {
  return (
    <div className="p-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto mb-6" />
          <Skeleton className="h-[280px] w-[280px] mx-auto rounded-2xl mb-6" />
          <Skeleton className="h-12 w-full rounded-lg mb-4" />
          <div className="flex gap-3 justify-center">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <Skeleton className="h-5 w-48 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-36 mb-1" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <Skeleton className="h-5 w-36 mb-4" />
            <Skeleton className="h-10 w-full rounded-lg mb-3" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Check-in page skeleton
export function CheckInSkeleton() {
  return (
    <div className="p-6 max-w-3xl space-y-6 animate-in fade-in duration-300">
      {/* Status card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-10 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-6 w-24 rounded-full ml-auto" />
          </div>
        </div>
      </div>

      {/* Method tabs */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 text-center">
            <Skeleton className="h-6 w-6 mx-auto mb-2" />
            <Skeleton className="h-4 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Method content */}
      <div className="bg-card border border-border rounded-lg p-6">
        <Skeleton className="h-[200px] w-full rounded-lg mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
