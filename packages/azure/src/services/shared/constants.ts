import { KIBIBYTE } from "@esposter/shared";

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
// Event Grid caps a publish REQUEST at 1 MB, independently of the per-event cap — so a batch of individually legal
// Events is still rejected whole once their sum crosses it. The mocks refuse a request over this cap as the service does
export const MAX_EVENT_GRID_PUBLISH_REQUEST_BYTES: number = 1024 * KIBIBYTE;
// Half of the request cap, in bytes of the serialized events, because the publisher measures only the events it hands
// Over: the array's own punctuation and the fields the service stamps on each one (topic, eventTime, metadataVersion)
// Are outside what it can see. The replay is what needs this — Event Grid writes whatever expired together into one
// Dead-letter blob, so a blob at the event cap republished as a single request exceeds the request cap, and the replay
// Subscription has no dead letter of its own: the rejection burns every attempt on the same oversized batch and the
// Events are discarded for good.
export const MAX_EVENT_GRID_PUBLISH_BYTES: number = MAX_EVENT_GRID_PUBLISH_REQUEST_BYTES / 2;
// The other half of the publish-request cap: Event Grid also bounds a request at 5,000 events, independently of
// Its size, so a batch of small events clears the byte budget above and is still rejected whole. Taken exactly
// Rather than halved like the byte budget, because nothing the service adds is invisible here — the count it
// Enforces is the length of the array the publisher hands over, which the publisher can measure precisely
export const MAX_EVENT_GRID_PUBLISH_EVENT_COUNT = 5000;
