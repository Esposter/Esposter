import { MEBIBYTE } from "#src/services/shared/constants";
import { HOSTED_TEXT_EXTENSIONS } from "@esposter/db-schema";

// The largest object a publish stores: one request per object, and a bound on what a preload holds in memory. The owner may
// Change the figure, and a file over it is refused before any object is written
export const HOSTED_OBJECT_MAX_BYTES: number = 16 * MEBIBYTE;
// The formats a publish refuses. Audio is published as MP3, which the lock names, so an uncompressed file never reaches a bucket
export const HOSTED_BANNED_EXTENSIONS: ReadonlySet<string> = new Set([".wav"]);
// The text a reader fetches, stored Brotli-compressed. Every other format is already compressed and stored as it is
export const HOSTED_BROTLI_EXTENSIONS: ReadonlySet<string> = new Set(
  HOSTED_TEXT_EXTENSIONS.map((extension) => `.${extension}`),
);
