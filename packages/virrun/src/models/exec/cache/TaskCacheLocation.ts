// A task-cache entry's on-disk address, resolved without materializing anything (resolveTaskCacheLocation). Host-
// Global and keyed by the task key (command + lockfile + source tree), so an identical run on any repo checkout
// Reuses it. `exists` reflects whether the meta file has been written (a complete, replayable entry).
export interface TaskCacheLocation {
  readonly dir: string;
  readonly exists: boolean;
  readonly metaFile: string;
  readonly payloadDir: string;
}
