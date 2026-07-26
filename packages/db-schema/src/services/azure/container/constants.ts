import { AzureContainer } from "@/models/azure/container/AzureContainer";
import { dayjs } from "@/services/dayjs";

export const DEAD_LETTER_ARCHIVED_PREFIX = "archived/";
// Storage's BlobCreated subject shape; the replay subscription filters on it and the replay handler
// Strips it back off to recover the blob name.
export const DEAD_LETTER_BLOB_SUBJECT_PREFIX = `/blobServices/default/containers/${AzureContainer.DeadLetter}/blobs/`;
export const DEAD_LETTER_QUARANTINE_PREFIX = "quarantine/";
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
// How long a read SAS stays valid. Clients cache the urls they were handed, so they also re-mint on this.
export const READ_SAS_DURATION_MS = dayjs.duration(1, "day").asMilliseconds();
// The cadence a client re-mints its cached read urls on, and the margin that counts one as already expired.
// Nothing else refreshes them — a page read only mints urls it does not already hold — so a room left open
// Longer than the duration above would render every attachment broken until reload. A tick that finds nothing
// Aging out costs nothing, which is why this can be short relative to the duration.
export const READ_SAS_REFRESH_INTERVAL_MS = dayjs.duration(1, "hour").asMilliseconds();
// How long a write SAS stays valid. Also the age a blob must reach before a prefix sweep may treat it as an
// Orphan: anything younger could still belong to an upload whose owning row write has not landed yet.
export const WRITE_SAS_DURATION_MS = dayjs.duration(1, "hour").asMilliseconds();
