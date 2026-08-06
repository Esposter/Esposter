// One settle pass costs two blob requests per row, so the batch is bounded rather than "everything expired".
// Whatever it does not reach keeps its row and is re-driven on the next tick, exactly like the purge sweep.
export const MAX_SETTLE_STORAGE_BLOBS = 500;
// The probes are independent, so they go out in bounded waves — one request per row all at once exhausts
// Sockets and throttles, the same discipline the deletion handler applies to its own listing.
export const MAX_CONCURRENT_STORAGE_BLOB_PROBES = 20;
