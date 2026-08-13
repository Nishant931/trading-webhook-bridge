'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '../lib/useSocket';
import { audioNotifier } from '../lib/audioNotifier';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, BellOff, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function Dashboard() {
  const { isConnected, signals } = useSocket();
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    audioNotifier.enabled = audioEnabled;
  }, [audioEnabled]);

  useEffect(() => {
    if (signals.length > 0) {
      const latest = signals[0];
      if (latest.action === 'EXIT' || latest.status === 'FAILED') {
        audioNotifier.playExitBuzz();
      } else {
        audioNotifier.playBuyChime();
      }
    }
  }, [signals]);

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Trading Webhook Bridge
            </h1>
            <p className="text-neutral-400 mt-1">Real-time execution monitor</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                audioEnabled 
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {audioEnabled ? <Bell size={18} /> : <BellOff size={18} />}
              <span className="text-sm font-medium">{audioEnabled ? 'Sound On' : 'Sound Off'}</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800">
              <div className="relative flex h-3 w-3">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </div>
              <span className="text-sm font-medium text-neutral-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Signals Today" value={signals.length.toString()} icon={<Activity className="text-cyan-400" />} />
          <StatCard title="Active Position" value={signals.length > 0 ? (signals[0].tradedSymbol || 'NONE') : 'NONE'} icon={<AlertTriangle className="text-amber-400" />} />
          <StatCard title="Execution Speed" value="12ms" icon={<Clock className="text-indigo-400" />} />
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
            <h2 className="text-lg font-semibold text-neutral-200">Live Executions</h2>
          </div>
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 text-sm">
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Contract</th>
                  <th className="px-6 py-4 font-medium">Price / SL / TP</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {signals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                        Waiting for signals...
                      </td>
                    </tr>
                  ) : (
                    signals.map((sig, i) => (
                      <motion.tr 
                        key={i + (sig.timestamp || '')}
                        initial={{ opacity: 0, y: -10, backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
                        animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                        transition={{ duration: 0.5 }}
                        className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-neutral-400">
                          {new Date(sig.timestamp || Date.now()).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wider ${
                            sig.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {sig.action || 'BUY'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-neutral-200">
                          {sig.tradedSymbol || sig.symbol || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-400">
                          {sig.spot_price ? `₹${sig.spot_price}` : '-'} 
                          {sig.stop_loss && <span className="text-rose-400 ml-2">SL: {sig.stop_loss}</span>}
                          {sig.target && <span className="text-emerald-400 ml-2">TP: {sig.target}</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {sig.status === 'SUCCESS' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : sig.status === 'FAILED' ? (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                            )}
                            <span className="text-sm font-medium text-neutral-300">
                              {sig.status || 'QUEUED'}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-neutral-400">{title}</span>
        <div className="p-2 bg-neutral-800 rounded-lg shadow-inner">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-neutral-100">{value}</div>
    </div>
  );
}
