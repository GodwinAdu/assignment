'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Search, LogIn, LogOut, Loader2 } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
}

type ScanAction = 'check_in' | 'check_out';

function KioskContent() {
  const searchParams = useSearchParams();
  const qrToken = searchParams.get('t') || '';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [action, setAction] = useState<ScanAction>('check_in');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [label, setLabel] = useState('Office Attendance');
  const [currentTime, setCurrentTime] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Live clock
  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString('en-GB'));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch employees
  useEffect(() => {
    if (!qrToken) {
      setIsValid(false);
      return;
    }

    fetch(`/api/kiosk/scan?t=${qrToken}`)
      .then((res) => {
        if (!res.ok) throw new Error('Invalid QR');
        return res.json();
      })
      .then((data) => {
        setEmployees(data.employees);
        setLabel(data.label || 'Office Attendance');
      })
      .catch(() => {
        setIsValid(false);
      });
  }, [qrToken]);

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleScan = async () => {
    if (!selectedEmployee) return;
    setStatus('loading');
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/kiosk/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken,
          employeeId: selectedEmployee.id,
          action,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        // Reset after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setSelectedEmployee(null);
          setMessage('');
        }, 5000);
      } else {
        setStatus('error');
        setError(data.error);
        setTimeout(() => {
          setStatus('idle');
          setError('');
        }, 4000);
      }
    } catch {
      setStatus('error');
      setError('Network error. Please try again.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid QR Code</h1>
          <p className="text-gray-400">This QR code is expired or invalid. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Success/Error feedback screen
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900/30 to-black flex items-center justify-center p-4">
        <div className="text-center animate-in fade-in">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{message}</h1>
          <p className="text-xl text-green-400 font-semibold">{selectedEmployee?.name}</p>
          <p className="text-gray-400 mt-2">{currentTime}</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900/30 to-black flex items-center justify-center p-4">
        <div className="text-center animate-in fade-in">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-14 h-14 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{error}</h1>
          <p className="text-gray-400 mt-2">Please try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      {/* Header */}
      <div className="bg-black/50 border-b border-white/10 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {label}
            </h1>
            <p className="text-sm text-gray-400">Attendance Check-In</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-white">{currentTime}</p>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Action toggle */}
        <div className="flex gap-2 bg-white/5 rounded-xl p-1.5">
          <button
            onClick={() => setAction('check_in')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
              action === 'check_in'
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-5 h-5" />
            Check In
          </button>
          <button
            onClick={() => setAction('check_out')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
              action === 'check_out'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogOut className="w-5 h-5" />
            Check Out
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or department..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Employee list */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto rounded-xl">
          {filteredEmployees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                selectedEmployee?.id === emp.id
                  ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {emp.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{emp.name}</p>
                <p className="text-sm text-gray-400">{emp.department}</p>
              </div>
              {selectedEmployee?.id === emp.id && (
                <CheckCircle className="w-6 h-6 text-purple-400" />
              )}
            </button>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No employees found</p>
            </div>
          )}
        </div>

        {/* Confirm button */}
        {selectedEmployee && (
          <button
            onClick={handleScan}
            disabled={status === 'loading'}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
              action === 'check_in'
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
            } disabled:opacity-50`}
          >
            {status === 'loading' ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : action === 'check_in' ? (
              <>
                <LogIn className="w-6 h-6" />
                Check In – {selectedEmployee.name}
              </>
            ) : (
              <>
                <LogOut className="w-6 h-6" />
                Check Out – {selectedEmployee.name}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function KioskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    }>
      <KioskContent />
    </Suspense>
  );
}
