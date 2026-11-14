export const AZURE_MAX_BATCH_SIZE = 100;
export const AZURE_MAX_PAGE_SIZE = 1000;
// A Table string property holds 64 KiB, which is 32 Ki UTF-16 code units. The survey answers limit reads it
export const AZURE_MAX_STRING_PROPERTY_LENGTH: number = 32 * 1024;
// Azure Queue caps a message's visibility timeout (and its lifetime) at 7 days
export const AZURE_MAX_QUEUE_VISIBILITY_TIMEOUT_MS: number = Temporal.Duration.from({ days: 7 }).total("milliseconds");
// The storage sdk rejects a blob batch holding more than this many sub-requests outright, before issuing a
// Single delete — so a directory teardown must wave through it rather than hand it one batch. A resource's
// Directory has no ceiling (a files directory plus every retained published snapshot), and the throw lands on
// The purge that was tearing it down: the resource stays in the recycle bin and its blobs are billed forever.
export const MAX_BLOB_BATCH_DELETIONS = 256;
