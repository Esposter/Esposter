import { KIBIBYTE } from "@esposter/shared";

// How long a message can still be delivered after it was sent, and so how long a row a handler needs in order to apply
// It must outlive. The storage ledger is the one that obeys it: a hold stays counted for exactly this window plus the
// Write presigned url, so a reconcile for a blob can still arrive after the hold would otherwise have been collected.
// Design: openspec/specs/resource/storage-quotas/design.md
const QUEUE_DELIVERY_TTL = Temporal.Duration.from({ hours: 1 });
export const QUEUE_DELIVERY_TTL_MS: number = QUEUE_DELIVERY_TTL.total("milliseconds");
// A Cloudflare Queue caps a message at 128 KB. A blob name is bounded in CHARACTERS, not bytes — a filename is
// Arbitrary user text, so one maximal name of CJK or emoji serialises to several times its length in UTF-8 — so a count
// Alone cannot bound a message. Publishers therefore chunk against both: this ceiling on names, and the byte budget
// Below, measured on the serialised body. Each chunk is its own message, so a partial publish still makes the chunks
// That landed durable.
export const MAX_BLOB_DELETION_MESSAGE_BLOB_NAMES = 500;
// Half of the 128 KB message cap, in bytes of serialised `blobNames`. The rest absorbs the message's own envelope and
// JSON's quoting and commas, none of which the publisher measures. A message over the real cap is refused outright, and
// Since the publish is best-effort and post-persist, the refusal is silent and the blobs it named are never reclaimed.
export const MAX_BLOB_DELETION_MESSAGE_BYTES = 64 * KIBIBYTE;
// A prefix deletion enumerates its own set, which has no ceiling — a room's whole attachment directory can hold tens of
// Thousands of blobs. One DELETE per blob all at once would exhaust the worker's sockets and throttle the account, and
// A single rejection fails the whole run, so the deletes go out in bounded waves instead.
export const MAX_CONCURRENT_BLOB_DELETIONS = 100;
// How many times a dead-letter queue's consumer is redelivered a message its handler threw on. Pulumi declares it as
// Each dead-letter consumer's maxRetries, and the replay quarantines a dead letter on the delivery that reaches it
// Rather than republishing, so the last delivery always lands somewhere durable. Both read it here, so they
// Cannot disagree.
export const DEAD_LETTER_CONSUMER_MAX_RETRIES = 5;
// How long a quarantined dead letter's raw body is kept. The nightly purge removes it past this age. A body can carry
// Message text and names no owner, so an account erasure cannot find it: this retention is what bounds it instead.
// Design: openspec/specs/architecture/cloudflare-services/design.md
export const QUARANTINE_RETENTION_MS = Temporal.Duration.from({ days: 30 }).total("milliseconds");
