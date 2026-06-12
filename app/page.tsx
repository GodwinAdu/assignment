'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirectToDashboard = async () => {
      try {
        // Check if user is authenticated
        const response = await fetch('/api/employee/profile');

        if (response.ok) {
          const data = await response.json();
          // Redirect based on role from user data
          if (data.user?.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/employee/dashboard');
          }
        } else {
          // User not authenticated, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('[v0] Redirect error:', error);
        // On error, go to login
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    redirectToDashboard();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader className="w-12 h-12 text-primary animate-spin mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Smart Attendance System</h1>
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
}
