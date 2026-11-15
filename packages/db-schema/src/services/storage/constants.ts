// Every client-supplied piece of a blob name is one separator-free, non-dot segment. Blob names are assembled by
// Interpolation and the storage sdk hands the result to `URL.pathname`, which normalizes `..` away — so a segment
// Carrying a separator or a dot segment steers the write or the delete out of the prefix the caller was authorized for.
export const BLOB_SEGMENT_REGEX = /^(?!\.{1,2}$)[^/\\]+$/u;
export const FILENAME_MAX_LENGTH = 1000;
export const FILE_MAX_LENGTH = 10;
// The publish/duplicate asset clone runs on the request path over however many assets the content references —
// A page embedding hundreds of images would otherwise open that many concurrent probes and copies at once, which
// The account throttles, and one rejection fails the whole publish. So the copies go out in bounded waves, the
// Same discipline the deletion handler applies to its own listing (MAX_CONCURRENT_BLOB_DELETIONS).
export const MAX_CONCURRENT_BLOB_COPIES = 100;
// How long a presigned read url stays valid. Clients cache the urls they were handed, so they also re-mint on this.
export const READ_PRESIGNED_URL_DURATION_MS = Temporal.Duration.from({ days: 1 }).total("milliseconds");
// The cadence a client re-mints its cached read urls on, and the margin that counts one as already expired.
// Nothing else refreshes them — a page read only mints urls it does not already hold — so a room left open
// Longer than the duration above would render every attachment broken until reload. A tick that finds nothing
// Aging out costs nothing, which is why this can be short relative to the duration.
export const READ_PRESIGNED_URL_REFRESH_INTERVAL_MS = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
// How long a presigned write url stays valid. Also the age a blob must reach before a prefix sweep may treat it as an
// Orphan: anything younger could still belong to an upload whose owning row write has not landed yet.
export const WRITE_PRESIGNED_URL_DURATION_MS = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
