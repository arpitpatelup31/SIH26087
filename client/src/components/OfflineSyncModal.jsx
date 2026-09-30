import React from 'react';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Cpu, 
  Database, 
  Cloud, 
  CheckCircle2, 
  X, 
  Layers, 
  HardDrive,
  ArrowRight
} from 'lucide-react';

export const OfflineSyncModal = () => {
  const { 
    isOnline, 
    isSyncing, 
    syncQueue, 
    syncQueueCount, 
    lastSyncTime, 
    syncLog, 
    isSyncModalOpen, 
    setIsSyncModalOpen, 
    triggerSync, 
    toggleOfflineSimulation 
  } = useOfflineSync();

  if (!isSyncModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Offline-First Edge & Cloud Sync Architecture
                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase">
                  LMS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Designed for PACS & Rural Cooperatives with intermittent internet
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Architecture Pipeline Diagram */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Data Synchronization Pipeline
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-center text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                <HardDrive className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <div className="font-bold text-slate-800">Learner Device</div>
                <div className="text-[10px] text-slate-500">React UI / PWA</div>
              </div>

              <div className="hidden sm:flex justify-center text-emerald-500">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                <Database className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <div className="font-bold text-slate-800">Local SQLite / Queue</div>
                <div className="text-[10px] text-slate-500">Raspberry Pi Edge</div>
              </div>

              <div className="hidden sm:flex justify-center text-emerald-500">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs col-span-1 sm:col-span-1">
                <Cloud className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="font-bold text-slate-800">Central Cloud</div>
                <div className="text-[10px] text-slate-500">PostgreSQL / API</div>
              </div>
            </div>
          </div>

          {/* Network & Edge Device State Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Network Simulation</span>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isOnline ? 'Online (Connected)' : 'Simulated Offline'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Toggle offline state to simulate completing lessons & quizzes on remote PACS field units without internet.
              </p>
              <button
                onClick={toggleOfflineSimulation}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  isOnline 
                    ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {isOnline ? 'Simulate Disconnection (Go Offline)' : 'Reconnect to Cloud Network'}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Sync Queue Status</span>
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
                  {syncQueueCount} pending items
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Last synchronized: <span className="font-semibold text-slate-700">{lastSyncTime || 'Recently'}</span>
              </p>
              <button
                onClick={triggerSync}
                disabled={isSyncing || syncQueueCount === 0 || !isOnline}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing to Cloud...' : 'Commit Sync Queue Now'}</span>
              </button>
            </div>
          </div>

          {/* Pending Queue Records List */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pending Edge Queue Items ({syncQueue.length})
            </h4>
            {syncQueue.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">All local data is fully synchronized</p>
                <p className="text-[11px] text-slate-400">Actions performed offline will be staged here automatically.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {syncQueue.map((item, idx) => (
                  <div key={item.id || idx} className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amber-900">{item.action}</span>
                      <span className="text-slate-500 ml-2 font-mono text-[10px]">({item.entityType})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 rounded-b-2xl flex justify-end">
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineSyncModal;
