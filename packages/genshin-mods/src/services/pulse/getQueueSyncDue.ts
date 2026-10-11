import { QUEUE_SYNC_MILLISECONDS } from "../constants";

// Whether the queue is synced on this tick: outside a turn, and either never synced or the sync interval has passed since
// The last one started
export const getQueueSyncDue = (lastSyncMs: number, nowMs: number, isTurnRunning: boolean): boolean =>
  !isTurnRunning && (lastSyncMs === 0 || nowMs - lastSyncMs >= QUEUE_SYNC_MILLISECONDS);
