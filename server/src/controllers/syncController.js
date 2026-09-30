import { dbHelper } from '../config/db.js';
import SyncService from '../services/syncService.js';

export const processSyncQueue = async (req, res) => {
  try {
    const { deviceId = 'edge-client-default', batch = [] } = req.body;
    const userId = req.user ? req.user.id : (req.body.userId || 1);

    if (!Array.isArray(batch) || batch.length === 0) {
      return res.status(400).json({ success: false, message: 'Batch array cannot be empty' });
    }

    const syncResults = SyncService.processSyncBatch(userId, deviceId, batch);

    res.json({
      success: true,
      message: `Synchronized ${syncResults.length} offline actions successfully with CoopConnect Cloud`,
      deviceId,
      syncedAt: new Date().toISOString(),
      results: syncResults
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error processing sync queue', error: err.message });
  }
};

export const getSyncStatus = (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    const recentLogs = dbHelper.all(`
      SELECT * FROM sync_queue 
      ${userId ? 'WHERE user_id = ?' : ''}
      ORDER BY created_at DESC 
      LIMIT 15
    `, userId ? [userId] : []);

    const totalSynced = dbHelper.get('SELECT COUNT(*) as count FROM sync_queue WHERE status = "synced"').count;

    res.json({
      success: true,
      edgeNode: {
        status: 'online',
        edgeRuntime: 'SQLite WAL Local Cache',
        cloudTarget: 'CoopConnect Central PostgreSQL/Cloud',
        totalSyncedItems: totalSynced,
        lastHeartbeat: new Date().toISOString()
      },
      recentLogs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching sync status', error: err.message });
  }
};
