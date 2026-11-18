import { MAX_READ_LIMIT, SITE_NAME } from "@esposter/shared";

// The most topics one watch or unwatch frame names, so one frame cannot fan its socket out to an unbounded number of
// Topic objects. A tab with more sends them over several frames
export const MAX_FRAME_TOPICS = MAX_READ_LIMIT;
// The longest id a topic names: a UUID, an integer or a short key, with room to spare and no more
export const TOPIC_ID_MAX_LENGTH = 256;
// The property a table carries its scope under. `Symbol.for` reads the global symbol registry, which other code
// Shares, so the key carries the product's prefix. Every copy of this package reads the same slot
export const TABLE_SCOPE_KEY = Symbol.for(`${SITE_NAME.toLowerCase()}.tableScope`);
// The hex characters of a secret's digest a scope topic names, which is what a topic carries in place of the secret
export const SCOPE_DIGEST_LENGTH = 12;
