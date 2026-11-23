import { MEBIBYTE } from "#src/services/shared/constants";
import { HOSTED_TEXT_EXTENSIONS } from "@esposter/db-schema";

// The largest object a publish stores: one request per object, and a bound on what a preload holds in memory. The owner may
// Change the figure, and a file over it is refused before any object is written
export const HOSTED_OBJECT_MAX_BYTES: number = 16 * MEBIBYTE;
// Lossless and uncompressed audio, which a publish refuses and the bundle check reads: audio is published as MP3, which the
// Lock names, So a file in either form never reaches a bucket
export const UNCOMPRESSED_AUDIO_EXTENSIONS: ReadonlySet<string> = new Set([".aiff", ".flac", ".wav"]);
// The text a reader fetches, stored Brotli-compressed. Every other format is already compressed and stored as it is
export const HOSTED_BROTLI_EXTENSIONS: ReadonlySet<string> = new Set(
  HOSTED_TEXT_EXTENSIONS.map((extension) => `.${extension}`),
);
// The extension every record is stored under, which names its content type through HOSTED_ASSET_CONTENT_TYPES
export const HOSTED_RECORD_EXTENSION = ".json";
export const DAY_MS: number = Temporal.Duration.from({ hours: 24 }).total("milliseconds");
// An object a lock no longer names is kept this long, so a revert within this window still resolves it
export const HOSTED_ASSET_RETENTION_MS: number = 90 * DAY_MS;
// An object stored this recently is reused as it is, so a prune run inside the retention window cannot take it
export const HOSTED_ASSET_REUSE_WINDOW_MS: number = HOSTED_ASSET_RETENTION_MS / 2;
// Every object is named by its content, so it never changes and may be cached for good
export const HOSTED_ASSET_CACHE_CONTROL = "public, max-age=31536000, immutable";
// Object bodies a publish compresses and holds at once, a wave at a time, so the copies waiting for a connection stay bounded.
// The connections themselves are bounded by the R2 transport, not here
export const MAX_CONCURRENT_OBJECT_BODIES = 16;
// Fetches in flight at once against one account, which keeps a check's memory bounded by one wave of objects
export const MAX_CONCURRENT_VERIFY_FETCHES = 16;
// Downloads in flight at once while the mirror is filled whole, which bounds the fill's memory by one wave of objects
export const MAX_CONCURRENT_MIRROR_DOWNLOADS = 16;

// The line that closes each constant `renderConstant` writes, after its body
export const RENDERED_CONSTANT_CLOSING = "} as const;";
