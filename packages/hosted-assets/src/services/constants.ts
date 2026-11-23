// The one Cache Storage every product's objects are kept in, since each url already embeds its product's scope
export const HOSTED_ASSETS_CACHE_NAME = "hosted-assets";
// A file is abandoned past this, so a stalled request cannot hold a preload open for good
export const HOSTED_ASSETS_FETCH_TIMEOUT_MS = 60_000;
// The files fetched at once, and the attempts each gets, with the wait before each retry growing from the base to the
// Max
export const HOSTED_ASSETS_DOWNLOAD_CONCURRENCY = 6;
export const HOSTED_ASSETS_DOWNLOAD_ATTEMPTS = 3;
export const HOSTED_ASSETS_RETRY_BASE_MS: number = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
export const HOSTED_ASSETS_RETRY_MAX_MS: number = Temporal.Duration.from({ seconds: 4 }).total("milliseconds");
// The base the test setup serves hosted objects from: the path its fetch route answers from the local mirror, so no
// Test Reaches the network for an object the mirror holds.
export const HOSTED_ASSETS_LOCAL_BASE_URL = "/hosted-assets";
// The content type each extension of a hosted object is served as, so a mirror answers with the type its publish
// Declares
export const HOSTED_ASSET_CONTENT_TYPES: Readonly<Record<string, string>> = {
  ".json": "application/json",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".tmx": "application/xml",
  ".tsx": "application/xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
