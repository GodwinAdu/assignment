'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { useFetch } from '@/hooks/useFetch';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data, loading } = useFetch<{ notifications: Notification[]; unreadCount: number }>(
    '/api/notifications?limit=50'
  );

  useEffect(() => {
    if (data?.notifications) {
      setNotifications(data.notifications);
    }
  }, [data]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(
          notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error('[v0] Error marking as read:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'leave_approved':
        return 'bg-green-500/10 text-green-500';
      case 'leave_rejected':
        return 'bg-red-500/10 text-red-500';
      case 'attendance_marked':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <main className="bg-background min-h-screen">
      <Header
        title="Notifications"
        subtitle="View and manage all your notifications"
      />

      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-2 w-2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`bg-card border border-border rounded-lg p-4 transition-all ${
                  !notif.isRead ? 'bg-muted/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                      notif.type
                    )}`}
                  >
                    {notif.type.replace('_', ' ')}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{notif.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
