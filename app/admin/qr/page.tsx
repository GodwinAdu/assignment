'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { useFetch } from '@/hooks/useFetch';
import { QrCode, Download, Printer, RefreshCw, CheckCircle, Copy, ExternalLink, Users, Clock } from 'lucide-react';

export default function AdminQRPage() {
  const [regenerating, setRegenerating] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState('');

  const { data, loading, fetch: refetch } = useFetch<any>('/api/admin/qr');

  // Generate QR image when data loads
  useEffect(() => {
    if (data?.activeQR?.checkinUrl) {
      // Use a QR code API to generate the image
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(data.activeQR.checkinUrl)}&format=png&margin=10`;
      setQrImageUrl(url);
    }
  }, [data]);

  const handleRegenerate = async () => {
    if (!confirm('⚠️ This will invalidate the current QR code.\n\nAll printed QR codes will stop working immediately.\n\nContinue?')) return;
    setRegenerating(true);
    try {
      await window.fetch('/api/admin/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel || 'Main Entrance' }),
      });
      refetch();
    } catch (err) {
      console.error('Regenerate failed:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data?.activeQR?.checkinUrl || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrImageUrl) return;
    const link = document.createElement('a');
    link.download = 'Office_Attendance_QR.png';
    link.href = qrImageUrl;
    link.target = '_blank';
    link.click();
  };

  const handlePrint = () => {
    const label = data?.activeQR?.label || 'Main Entrance';
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html><head><title>Office QR Code - ${label}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { display:flex; align-items:center; justify-content:center; min-height:100vh; font-family:system-ui,-apple-system,sans-serif; background:#fff; }
        .poster { width:380px; border:3px solid #111; border-radius:20px; overflow:hidden; text-align:center; }
        .poster-top { background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); padding:28px 20px; color:#fff; }
        .poster-top h1 { font-size:1.5rem; font-weight:800; }
        .poster-top p { font-size:0.85rem; opacity:0.9; margin-top:4px; }
        .qr-wrap { background:#fff; padding:30px; }
        .qr-wrap img { width:260px; height:260px; display:block; margin:0 auto; }
        .poster-body { background:#111; color:#f0f0f0; padding:24px; text-align:left; }
        .poster-body h2 { font-size:1rem; color:#667eea; margin-bottom:14px; }
        .steps { list-style:none; }
        .steps li { display:flex; gap:10px; align-items:flex-start; margin-bottom:10px; font-size:0.82rem; color:#bbb; }
        .steps li .num { width:22px; height:22px; border-radius:50%; background:rgba(102,126,234,0.15); color:#667eea; font-weight:700; font-size:0.72rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .poster-footer { background:#1a1a1a; padding:12px; font-size:0.7rem; color:#555; text-align:center; border-top:1px solid #222; }
        @media print { body { margin:0; padding:0; } .poster { box-shadow:none; } }
      </style></head>
      <body>
      <div class="poster">
        <div class="poster-top">
          <h1>Smart Attendance</h1>
          <p>${label} · Scan to Check In</p>
        </div>
        <div class="qr-wrap">
          <img src="${qrImageUrl}" alt="QR Code"/>
        </div>
        <div class="poster-body">
          <h2>📷 How to Check In</h2>
          <ol class="steps">
            <li><span class="num">1</span><div>Open your phone camera and point it at the QR code</div></li>
            <li><span class="num">2</span><div>Tap the link that appears on your screen</div></li>
            <li><span class="num">3</span><div>Find your name in the list and tap it</div></li>
            <li><span class="num">4</span><div>Tap <strong>Check In</strong> or <strong>Check Out</strong></div></li>
          </ol>
        </div>
        <div class="poster-footer">Smart Attendance System · Workforce Management</div>
      </div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),500)}<\/script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-background min-h-screen">
        <div className="border-b border-border p-6">
          <h1 className="text-3xl font-bold text-foreground">Office QR Code</h1>
          <p className="text-muted-foreground mt-1">Manage the shared office QR code for attendance check-in.</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: QR Display */}
              <div className="space-y-6">
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    {data?.activeQR?.label || 'Main Entrance'}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Print this QR and post it at the office entrance
                  </p>

                  {/* QR Image */}
                  <div className="inline-block bg-white p-5 rounded-2xl shadow-lg shadow-black/20 mb-6">
                    {qrImageUrl ? (
                      <img
                        src={qrImageUrl}
                        alt="Office QR Code"
                        width={280}
                        height={280}
                        className="block"
                      />
                    ) : (
                      <div className="w-[280px] h-[280px] bg-gray-100 flex items-center justify-center rounded">
                        <QrCode className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* URL Preview */}
                  <div className="bg-secondary/30 rounded-lg p-3 mb-6 text-left">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">Kiosk URL</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-primary flex-1 break-all font-mono">
                        {data?.activeQR?.checkinUrl || '...'}
                      </code>
                      <button onClick={handleCopy} className="p-1.5 hover:bg-secondary rounded flex-shrink-0">
                        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-center gap-8 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{data?.todayScans || 0}</p>
                      <p className="text-xs text-muted-foreground">Scans today</p>
                    </div>
                    <div className="w-px bg-border" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        {data?.activeQR?.createdAt ? new Date(data.activeQR.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '–'}
                      </p>
                      <p className="text-xs text-muted-foreground">Generated</p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                      <Download className="w-4 h-4" /> Download PNG
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors">
                      <Printer className="w-4 h-4" /> Print Poster
                    </button>
                    <a
                      href={data?.activeQR?.checkinUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Preview
                    </a>
                  </div>
                </div>
              </div>

              {/* Right: Instructions + Regenerate + Scans */}
              <div className="space-y-6">
                {/* How it works */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">How the QR System Works</h3>
                  <div className="space-y-4">
                    {[
                      { step: '1', title: 'Print and post the QR', desc: 'Download or print the QR poster and place it at the office entrance, reception, or clock-in area.' },
                      { step: '2', title: 'Employee scans with phone camera', desc: 'No app needed — the phone\'s built-in camera reads the QR and opens the check-in page automatically.' },
                      { step: '3', title: 'They tap their name', desc: 'A mobile page shows all employees. They search or scroll to find their name and tap it.' },
                      { step: '4', title: 'They tap Check In or Check Out', desc: 'One tap records their attendance. Time, late status, and hours are calculated automatically.' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Attendance is recorded instantly</p>
                        <p className="text-sm text-muted-foreground">Results appear in the admin dashboard and employee records immediately.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regenerate */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Regenerate QR Code</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a new code if the current one is compromised or you want to reset it.
                    <span className="text-red-400 font-medium"> The old printed QR will stop working immediately.</span>
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Location Label</label>
                      <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="e.g. Main Entrance, Floor 2, Reception..."
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                      {regenerating ? 'Regenerating...' : 'Regenerate QR Code'}
                    </button>
                  </div>
                </div>

                {/* Recent Scans */}
                {data?.recentScans && data.recentScans.length > 0 && (
                  <div className="bg-card rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Recent Scans</h3>
                      <span className="text-xs text-muted-foreground">Last 10</span>
                    </div>
                    <div className="space-y-3">
                      {data.recentScans.map((scan: any) => (
                        <div key={scan._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {scan.employeeName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{scan.employeeName}</p>
                              <p className="text-xs text-muted-foreground">
                                {scan.scanType === 'check_in' ? '→ Check In' : '← Check Out'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              scan.scanResult === 'success'
                                ? 'bg-green-500/20 text-green-400'
                                : scan.scanResult === 'already_checked'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {scan.scanResult === 'success' ? '✓ Success' : scan.scanResult === 'already_checked' ? 'Already done' : '✗ Failed'}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(scan.scannedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* QR History */}
                {data?.history && data.history.length > 1 && (
                  <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">QR Code History</h3>
                    <div className="space-y-2">
                      {data.history.map((h: any) => (
                        <div key={h._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div>
                            <p className="text-sm font-medium text-foreground">{h.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(h.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            h.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {h.isActive ? 'Active' : 'Expired'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
