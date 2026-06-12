'use client';

import { useState, useEffect, useRef } from 'react';
import { EmployeeSidebar } from '@/components/employee/Sidebar';
import { Header } from '@/components/Header';
import { CheckInSkeleton } from '@/components/skeletons';
import { MapPin, AlertTriangle, CheckCircle, MapIcon, Loader2, QrCode, Camera, Clock, LogIn, LogOut, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendancePage() {
  const [selectedMethod, setSelectedMethod] = useState<'gps' | 'qr' | 'manual'>('gps');
  const [isLoading, setIsLoading] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Live clock
  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString('en-GB'));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch today's status
  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const res = await window.fetch('/api/employee/dashboard');
      if (res.ok) {
        const data = await res.json();
        setTodayStatus(data.today);
      }
    } catch {}
  };

  // GPS Check-in
  const handleGPSCheckIn = () => {
    setIsLoading(true);
    setCheckInStatus('idle');

    if (!navigator.geolocation) {
      setCheckInStatus('error');
      setStatusMessage('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });

        try {
          const res = await window.fetch('/api/attendance/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              checkInMethod: 'gps',
              latitude: lat,
              longitude: lng,
            }),
          });

          const result = await res.json();
          if (res.ok) {
            setCheckInStatus('success');
            setStatusMessage(`Check-in successful! Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            toast.success(result.isLate ? 'Checked in (marked as late)' : 'GPS Check-in successful!', {
              description: `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            });
            fetchTodayStatus();
          } else {
            setCheckInStatus('error');
            setStatusMessage(result.error || 'Check-in failed');
            toast.error('Check-in failed', { description: result.error });
          }
        } catch {
          setCheckInStatus('error');
          setStatusMessage('Network error. Please try again.');
        }
        setIsLoading(false);
      },
      () => {
        setCheckInStatus('error');
        setStatusMessage('Unable to get your location. Please enable location services.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // GPS Check-out
  const handleGPSCheckOut = () => {
    setIsLoading(true);
    setCheckInStatus('idle');

    if (!navigator.geolocation) {
      setCheckInStatus('error');
      setStatusMessage('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const res = await window.fetch('/api/attendance/check-out', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: lat, longitude: lng }),
          });

          const result = await res.json();
          if (res.ok) {
            setCheckInStatus('success');
            setStatusMessage(`Check-out successful! Hours worked: ${result.hoursWorked?.toFixed(1)}h`);
            toast.success('Check-out successful!', {
              description: `Hours worked today: ${result.hoursWorked?.toFixed(1)}h`,
            });
            fetchTodayStatus();
          } else {
            setCheckInStatus('error');
            setStatusMessage(result.error || 'Check-out failed');
            toast.error('Check-out failed', { description: result.error });
          }
        } catch {
          setCheckInStatus('error');
          setStatusMessage('Network error. Please try again.');
        }
        setIsLoading(false);
      },
      () => {
        setCheckInStatus('error');
        setStatusMessage('Unable to get your location.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Manual Check-in
  const handleManualCheckIn = async () => {
    setIsLoading(true);
    setCheckInStatus('idle');
    try {
      const res = await window.fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkInMethod: 'manual' }),
      });
      const result = await res.json();
      if (res.ok) {
        setCheckInStatus('success');
        setStatusMessage('Manual check-in successful!');
        fetchTodayStatus();
      } else {
        setCheckInStatus('error');
        setStatusMessage(result.error || 'Check-in failed');
      }
    } catch {
      setCheckInStatus('error');
      setStatusMessage('Network error.');
    }
    setIsLoading(false);
  };

  // Manual Check-out
  const handleManualCheckOut = async () => {
    setIsLoading(true);
    setCheckInStatus('idle');
    try {
      const res = await window.fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await res.json();
      if (res.ok) {
        setCheckInStatus('success');
        setStatusMessage(`Check-out successful! Hours: ${result.hoursWorked?.toFixed(1)}h`);
        fetchTodayStatus();
      } else {
        setCheckInStatus('error');
        setStatusMessage(result.error || 'Check-out failed');
      }
    } catch {
      setCheckInStatus('error');
      setStatusMessage('Network error.');
    }
    setIsLoading(false);
  };

  // QR Camera Scanner
  const startQRScanner = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setCheckInStatus('error');
      setStatusMessage('Unable to access camera. Please grant camera permission.');
      setScanning(false);
    }
  };

  const stopQRScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  // QR check-in (when employee scans the office QR poster)
  const handleQRCheckIn = async () => {
    setIsLoading(true);
    setCheckInStatus('idle');
    stopQRScanner();

    try {
      const res = await window.fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkInMethod: 'qr' }),
      });
      const result = await res.json();
      if (res.ok) {
        setCheckInStatus('success');
        setStatusMessage('QR Check-in successful!');
        fetchTodayStatus();
      } else {
        setCheckInStatus('error');
        setStatusMessage(result.error || 'QR Check-in failed');
      }
    } catch {
      setCheckInStatus('error');
      setStatusMessage('Network error.');
    }
    setIsLoading(false);
  };

  const isCheckedIn = !!todayStatus?.checkInTime;
  const isCheckedOut = !!todayStatus?.checkOutTime;

  return (
    <div className="flex">
      <EmployeeSidebar />
      <main className="flex-1 bg-background min-h-screen">
        <Header title="Check In/Out" subtitle="Mark your attendance using GPS, QR code, or manual check-in." />

        <div className="p-6 max-w-3xl space-y-6">
          {/* Today's Status Card */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Status</p>
                <p className="text-3xl font-mono font-bold text-foreground mt-1">{currentTime}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right space-y-1">
                {isCheckedIn && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">In: </span>
                    <span className="font-semibold text-green-400">
                      {new Date(todayStatus.checkInTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                )}
                {isCheckedOut && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Out: </span>
                    <span className="font-semibold text-blue-400">
                      {new Date(todayStatus.checkOutTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                )}
                {todayStatus?.hoursWorked > 0 && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Hours: </span>
                    <span className="font-semibold text-primary">{todayStatus.hoursWorked.toFixed(1)}h</span>
                  </p>
                )}
                {!isCheckedIn && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    Not checked in
                  </span>
                )}
                {isCheckedIn && !isCheckedOut && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    Checked in
                  </span>
                )}
                {isCheckedOut && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Day complete ✓
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Method Selection */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => { setSelectedMethod('gps'); setCheckInStatus('idle'); }}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                selectedMethod === 'gps' ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-foreground text-sm">GPS</p>
              <p className="text-xs text-muted-foreground mt-0.5">Location-based</p>
            </button>
            <button
              onClick={() => { setSelectedMethod('qr'); setCheckInStatus('idle'); }}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                selectedMethod === 'qr' ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <QrCode className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-foreground text-sm">QR Code</p>
              <p className="text-xs text-muted-foreground mt-0.5">Scan office QR</p>
            </button>
            <button
              onClick={() => { setSelectedMethod('manual'); setCheckInStatus('idle'); }}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                selectedMethod === 'manual' ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <Smartphone className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-foreground text-sm">Manual</p>
              <p className="text-xs text-muted-foreground mt-0.5">One-tap check</p>
            </button>
          </div>

          {/* GPS Method */}
          {selectedMethod === 'gps' && (
            <div className="bg-card rounded-lg border border-border p-6 space-y-5">
              <div className="bg-secondary/30 rounded-lg p-6 text-center">
                <MapIcon className="w-12 h-12 text-primary mx-auto mb-3 opacity-70" />
                <p className="text-foreground font-medium">GPS Location Check-In</p>
                <p className="text-muted-foreground text-sm mt-1">Your location will be verified against the office geofence</p>
                {location && (
                  <p className="text-xs text-primary mt-3 font-mono">
                    📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGPSCheckIn}
                  disabled={isLoading || isCheckedIn}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  {isCheckedIn ? 'Already In' : 'Check In'}
                </button>
                <button
                  onClick={handleGPSCheckOut}
                  disabled={isLoading || !isCheckedIn || isCheckedOut}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                  {isCheckedOut ? 'Already Out' : 'Check Out'}
                </button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-400 text-sm">How GPS check-in works</p>
                  <p className="text-xs text-blue-400/80 mt-1">
                    We capture your GPS coordinates and verify you&apos;re within the office geofence radius. Make sure location services are enabled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Method */}
          {selectedMethod === 'qr' && (
            <div className="bg-card rounded-lg border border-border p-6 space-y-5">
              <div className="bg-secondary/30 rounded-lg p-4 text-center">
                {scanning ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full max-w-sm mx-auto rounded-lg aspect-square object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-primary rounded-lg opacity-70" />
                    </div>
                    <button
                      onClick={stopQRScanner}
                      className="mt-3 px-4 py-2 bg-destructive text-white rounded-lg text-sm font-medium"
                    >
                      Stop Camera
                    </button>
                  </div>
                ) : (
                  <div className="py-6">
                    <QrCode className="w-16 h-16 text-primary mx-auto mb-3 opacity-70" />
                    <p className="text-foreground font-medium">QR Code Check-In</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Scan the office QR poster or use the button below
                    </p>
                    <button
                      onClick={startQRScanner}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Open Camera
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleQRCheckIn}
                  disabled={isLoading || isCheckedIn}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  {isCheckedIn ? 'Already In' : 'QR Check In'}
                </button>
                <button
                  onClick={handleManualCheckOut}
                  disabled={isLoading || !isCheckedIn || isCheckedOut}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                  {isCheckedOut ? 'Already Out' : 'Check Out'}
                </button>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex gap-3">
                <QrCode className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-400 text-sm">How QR check-in works</p>
                  <p className="text-xs text-purple-400/80 mt-1">
                    Point your camera at the office QR poster, or simply tap &quot;QR Check In&quot; if you&apos;re at the office. 
                    Alternatively, scan the kiosk QR at the entrance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Method */}
          {selectedMethod === 'manual' && (
            <div className="bg-card rounded-lg border border-border p-6 space-y-5">
              <div className="bg-secondary/30 rounded-lg p-6 text-center">
                <Clock className="w-12 h-12 text-primary mx-auto mb-3 opacity-70" />
                <p className="text-foreground font-medium">Manual Check-In</p>
                <p className="text-muted-foreground text-sm mt-1">One-tap check-in without location or QR verification</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleManualCheckIn}
                  disabled={isLoading || isCheckedIn}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
                  {isCheckedIn ? 'Already Checked In' : 'Check In'}
                </button>
                <button
                  onClick={handleManualCheckOut}
                  disabled={isLoading || !isCheckedIn || isCheckedOut}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogOut className="w-6 h-6" />}
                  {isCheckedOut ? 'Already Checked Out' : 'Check Out'}
                </button>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-400 text-sm">Note</p>
                  <p className="text-xs text-yellow-400/80 mt-1">
                    Manual check-in may require admin approval depending on company settings.
                    GPS and QR methods are preferred for verification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {checkInStatus === 'success' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex gap-3 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-400">Success!</p>
                <p className="text-sm text-green-400/80 mt-1">{statusMessage}</p>
              </div>
            </div>
          )}

          {checkInStatus === 'error' && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Error</p>
                <p className="text-sm text-destructive/80 mt-1">{statusMessage}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
