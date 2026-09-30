import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncApi } from '../services/api';

const OfflineSyncContext = createContext();

export const OfflineSyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueue, setSyncQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('coop_sync_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lastSyncTime, setLastSyncTime] = useState(localStorage.getItem('coop_last_sync') || null);
  const [syncLog, setSyncLog] = useState([]);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save sync queue changes to localStorage
  useEffect(() => {
    localStorage.setItem('coop_sync_queue', JSON.stringify(syncQueue));
  }, [syncQueue]);

  // Add action to offline queue
  const enqueueOfflineAction = (action, entityType, payload) => {
    const queueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      entityType,
      payload,
      createdAt: new Date().toISOString()
    };

    setSyncQueue(prev => [...prev, queueItem]);
    return queueItem;
  };

  // Trigger synchronization of offline queue with central cloud API
  const triggerSync = async () => {
    const currentQueue = JSON.parse(localStorage.getItem('coop_sync_queue') || '[]');
    if (currentQueue.length === 0) return { success: true, count: 0 };

    setIsSyncing(true);
    try {
      const res = await syncApi.sendBatch(currentQueue, 'coop-edge-rpi-01');
      if (res.success) {
        setSyncQueue([]);
        localStorage.removeItem('coop_sync_queue');
        const now = new Date().toLocaleTimeString();
        setLastSyncTime(now);
        localStorage.setItem('coop_last_sync', now);
        setSyncLog(prev => [
          { time: now, message: `Synced ${currentQueue.length} records successfully to cloud database`, status: 'success' },
          ...prev.slice(0, 9)
        ]);
        return { success: true, count: currentQueue.length };
      }
    } catch (err) {
      console.error('Offline sync failed:', err);
      setSyncLog(prev => [
        { time: new Date().toLocaleTimeString(), message: `Sync error: ${err.message}`, status: 'error' },
        ...prev.slice(0, 9)
      ]);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle simulated offline mode (for judging demo)
  const toggleOfflineSimulation = () => {
    setIsOnline(prev => !prev);
  };

  return (
    <OfflineSyncContext.Provider value={{
      isOnline,
      isSyncing,
      syncQueueCount: syncQueue.length,
      syncQueue,
      lastSyncTime,
      syncLog,
      isSyncModalOpen,
      setIsSyncModalOpen,
      enqueueOfflineAction,
      triggerSync,
      toggleOfflineSimulation
    }}>
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = () => useContext(OfflineSyncContext);
