import { MAX_READ_LIMIT, SITE_NAME } from "@esposter/shared";

// The most topics one watch or unwatch frame names, so one frame cannot fan its socket out to an unbounded number of
// Topic objects. A tab with more sends them over several frames
export const MAX_FRAME_TOPICS = MAX_READ_LIMIT;
// The longest id a topic names: a UUID, an integer or a short key, with room to spare and no more
export const TOPIC_ID_MAX_LENGTH = 256;
// The most columns one table's watch or publish names. A table has a few dozen, so this only bounds a frame
export const MAX_TABLE_COLUMNS = 256;
// The longest key a blob topic names whole: R2's key limit, so every key the bucket takes publishes a topic the schema accepts
export const BLOB_KEY_MAX_LENGTH = 1024;
// The property a table carries its scope under. `Symbol.for` reads the global symbol registry, which other code
// Shares, so the key carries the product's prefix. Every copy of this package reads the same slot
export const TABLE_SCOPE_KEY = Symbol.for(`${SITE_NAME.toLowerCase()}.tableScope`);
// The hex characters of a secret's digest a scope topic names, which is what a topic carries in place of the secret
export const SCOPE_DIGEST_LENGTH = 12;
// The most topics one query's response header names. The header has a budget of about 5 KB, and a topic is about 80 bytes
// Encoded, so 5 KB holds 64 of them: a read past this has its topics with a coarser form collapsed to it, the largest group
// First (`fitTopicsBudget`). That wakes the read for every write to the group, and no less often than the topics it replaces
export const MAX_READ_TOPICS = (5 * 1024) / 80;
// How long a watch's signature is honoured after its read began: the hour a presigned write url lasts, so a stored watch
// Lapses as a write url's grant does. A watch past it is refused, and the refetch a reconnect makes reads the query again
export const TOPIC_WATCH_MAX_AGE_MS = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
