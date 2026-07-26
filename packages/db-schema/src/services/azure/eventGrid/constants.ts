// The schema version every event this system publishes carries. One value across all publishers, so a consumer
// Reading `dataVersion` is reading a single repo-wide contract rather than one literal per call site; it only moves
// When a `data` payload shape changes incompatibly.
export const EVENT_GRID_DATA_VERSION = "1.0";

// Event Grid caps a single event at 1 MB and a blob name at 1 KiB, so a deletion event carries at most this many
// Names — half the cap even if every name is maximal. A publisher with more to delete splits into one event per
// Chunk; each chunk is its own delivery, so a partial publish still makes the chunks that landed durable.
export const MAX_BLOB_DELETION_EVENT_BLOB_NAMES = 500;

// A prefix deletion enumerates its own set, which has no ceiling — a room's whole attachment directory can hold
// Tens of thousands of blobs. One DELETE per blob all at once would exhaust the worker's sockets and throttle the
// Account, and a single rejection fails the whole run, so the deletes go out in bounded waves instead.
export const MAX_CONCURRENT_BLOB_DELETIONS = 100;
