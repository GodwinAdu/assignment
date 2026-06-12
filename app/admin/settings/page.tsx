'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { SettingsSkeleton } from '@/components/skeletons';
import { MapPin, Clock, Building2, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: '',
    officeLocation: { latitude: 0, longitude: 0 },
    geofenceRadius: 500,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    lateMarginMinutes: 15,
    breakDurationMinutes: 60,
    expectedWorkingHoursPerDay: 8,
    timezone: 'Asia/Kolkata',
    allowRemoteWork: false,
    requireGPSVerification: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data, loading } = useFetch<{ settings: any }>('/api/admin/settings');

  useEffect(() => {
    if (data?.settings) {
      setSettings({
        companyName: data.settings.companyName || '',
        officeLocation: data.settings.officeLocation || { latitude: 0, longitude: 0 },
        geofenceRadius: data.settings.geofenceRadius || 500,
        workingHoursStart: data.settings.workingHoursStart || '09:00',
        workingHoursEnd: data.settings.workingHoursEnd || '18:00',
        lateMarginMinutes: data.settings.lateMarginMinutes || 15,
        breakDurationMinutes: data.settings.breakDurationMinutes || 60,
        expectedWorkingHoursPerDay: data.settings.expectedWorkingHoursPerDay || 8,
        timezone: data.settings.timezone || 'Asia/Kolkata',
        allowRemoteWork: data.settings.allowRemoteWork || false,
        requireGPSVerification: data.settings.requireGPSVerification ?? true,
      });
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await window.fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        toast.success('Settings saved successfully', {
          description: 'All changes have been applied.',
        });
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        toast.error('Failed to save settings', { description: data.error });
      }
    } catch (err) {
      toast.error('Network error', { description: 'Could not save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-background min-h-screen">
          <div className="border-b border-border p-6">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Configure company and attendance system settings.</p>
          </div>
          <SettingsSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-background">
        {/* Header */}
        <div className="border-b border-border p-6">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure company and attendance system settings.</p>
        </div>

        {/* Content */}
        <div className="p-6 max-w-4xl">
          {/* Company Settings */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Company Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                >
                  <option>Asia/Kolkata</option>
                  <option>UTC</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                  <option>Africa/Accra</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Settings */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Office Location</h2>
            </div>
            <div className="space-y-4">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setSettings({
                            ...settings,
                            officeLocation: {
                              latitude: parseFloat(pos.coords.latitude.toFixed(6)),
                              longitude: parseFloat(pos.coords.longitude.toFixed(6)),
                            },
                          });
                        },
                        (err) => {
                          alert('Unable to get location: ' + err.message);
                        },
                        { enableHighAccuracy: true }
                      );
                    } else {
                      alert('Geolocation is not supported by your browser');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg font-medium hover:bg-primary/20 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Use My Current Location
                </button>
                <p className="text-xs text-muted-foreground mt-2">Click to auto-fill with your current GPS coordinates</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Latitude</label>
                  <input
                    type="number"
                    value={settings.officeLocation.latitude}
                    onChange={(e) => setSettings({ ...settings, officeLocation: { ...settings.officeLocation, latitude: parseFloat(e.target.value) || 0 } })}
                    step="0.000001"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Longitude</label>
                  <input
                    type="number"
                    value={settings.officeLocation.longitude}
                    onChange={(e) => setSettings({ ...settings, officeLocation: { ...settings.officeLocation, longitude: parseFloat(e.target.value) || 0 } })}
                    step="0.000001"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Geofence Radius (meters)</label>
                <input
                  type="number"
                  value={settings.geofenceRadius}
                  onChange={(e) => setSettings({ ...settings, geofenceRadius: parseInt(e.target.value) || 500 })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Recommended: 300-1000 meters</p>
              </div>
            </div>
          </div>

          {/* Working Hours Settings */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Working Hours</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Time</label>
                  <input
                    type="time"
                    value={settings.workingHoursStart}
                    onChange={(e) => setSettings({ ...settings, workingHoursStart: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Time</label>
                  <input
                    type="time"
                    value={settings.workingHoursEnd}
                    onChange={(e) => setSettings({ ...settings, workingHoursEnd: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Late Margin (minutes)</label>
                  <input
                    type="number"
                    value={settings.lateMarginMinutes}
                    onChange={(e) => setSettings({ ...settings, lateMarginMinutes: parseInt(e.target.value) || 15 })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Break Duration (minutes)</label>
                  <input
                    type="number"
                    value={settings.breakDurationMinutes}
                    onChange={(e) => setSettings({ ...settings, breakDurationMinutes: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Expected Working Hours per Day</label>
                <input
                  type="number"
                  value={settings.expectedWorkingHoursPerDay}
                  onChange={(e) => setSettings({ ...settings, expectedWorkingHoursPerDay: parseFloat(e.target.value) || 8 })}
                  step="0.5"
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Feature Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Allow Remote Work</p>
                  <p className="text-sm text-muted-foreground">Enable employees to check-in from any location</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowRemoteWork}
                  onChange={(e) => setSettings({ ...settings, allowRemoteWork: e.target.checked })}
                  className="w-5 h-5 rounded border-border accent-primary"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Require GPS Verification</p>
                  <p className="text-sm text-muted-foreground">Verify employee location at check-in/out</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireGPSVerification}
                  onChange={(e) => setSettings({ ...settings, requireGPSVerification: e.target.checked })}
                  className="w-5 h-5 rounded border-border accent-primary"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" /> Settings saved
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
