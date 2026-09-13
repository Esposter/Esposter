// The four bytes every object opens with, so a stranger's bytes are refused outright rather than handed to the
// Decompressor as a frame
export const OBJECT_MAGIC: Uint8Array = new Uint8Array([0x4b, 0x46, 0x53, 0x54]);
// The framing version, so a future encoder is recognisable rather than misread. Bumped only when the header
// Layout below changes — a change to the compression parameters alone is carried by the header's own fields
export const OBJECT_FORMAT_VERSION = 1;
// Header layout: magic, version, flags, windowLog, reserved, and then the base hash on a delta only
export const OBJECT_VERSION_OFFSET = 4;
export const OBJECT_FLAGS_OFFSET = 5;
export const OBJECT_WINDOW_LOG_OFFSET = 6;
export const OBJECT_HEADER_BYTE_COUNT = 8;
// The two flag values this format writes; any other is a stranger's byte and the object is refused
export const KEYFRAME_FLAG = 0;
export const DELTA_FLAG = 1;
// A content address is the raw SHA-256 of the plaintext — 32 bytes on the wire, 64 hex characters as a key
export const HASH_BYTE_COUNT = 32;
export const DELTA_HEADER_BYTE_COUNT: number = OBJECT_HEADER_BYTE_COUNT + HASH_BYTE_COUNT;
// Level 19 buys a marginally smaller delta for whole seconds on a multi-megabyte document, on a path a user is
// Waiting behind, and below 12 the ratio degrades sharply and non-monotonically because the lower levels give
// Up on exactly the long-range matches a near-duplicate document is made of
export const DEFAULT_COMPRESSION_LEVEL = 12;
// Zstd's own bounds on a frame's window. The upper bound is 128 MiB, which is far past any document this
// Stores while staying inside what a decoder is willing to allocate
export const MIN_WINDOW_LOG = 10;
export const MAX_WINDOW_LOG = 27;
// A delta is written only when it compresses to at most this share of the version's own standalone size —
// Past that the version has drifted too far from its anchor to be worth a second read forever
export const DEFAULT_PROMOTION_RATIO: number = 1 / 3;
// The bytes a keyframe's deltas may accumulate to before the next one promotes, as a multiple of the
// Keyframe's own stored size, so a segment costs at most that many compressed copies whatever the edit pattern
export const DEFAULT_SEGMENT_BUDGET_RATIO = 1;
