// A live-user lease on a snapshot/prepare hash dir (a `leases/<pid>` file). Held for the duration of a run so
// A `pruneStale*` pass won't evict a layer another process is still reading; release() drops it on dispose.
export interface Lease {
  release: () => void;
}
