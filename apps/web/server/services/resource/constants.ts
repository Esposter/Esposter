// Trigram similarity is the fraction of trigrams two strings share. pg_trgm's own default cutoff
// Is the sweet spot: "survye" still finds "Survey" without unrelated names leaking into results.
export const SEARCH_SIMILARITY_THRESHOLD = 0.3;
// Autosave fires far more often than a user thinks of "I saved" — without coalescing every
// Keystroke burst would flood the partition. One entry per user per hour is the readable trail.
export const CONTENT_SAVED_COALESCE_WINDOW_MS = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
// Short-lived because the asset endpoint re-signs on every request — minutes-scale keeps a leaked url
// Nearly worthless and stays compatible with the 7-day user-delegation SAS cap
export const RESOURCE_ASSET_SAS_DURATION_MS = Temporal.Duration.from({ minutes: 15 }).total("milliseconds");
// Just under the SAS life so a browser-cached redirect can never outlive its signature
export const RESOURCE_ASSET_CACHE_MAX_AGE_SECONDS = Temporal.Duration.from({ minutes: 14 }).total("seconds");
// Bounded so a hot resource's concurrent increments cannot spin the read path; on exhaustion the count drops
export const MAX_VIEW_COUNT_ETAG_RETRIES = 3;
// Appended to a duplicated resource's name; the base name is truncated so the whole stays within the length check
export const DUPLICATE_NAME_SUFFIX = " (copy)";
// A content update that loses to a save made in between is read again and reapplied this many times in all, and then
// The call fails rather than write over that save
export const MAX_CONTENT_UPDATE_ATTEMPTS = 3;
// The most an agent's read answers, in bytes of JSON: at a few bytes a token, well under the 25,000 tokens Claude Code
// Accepts from one MCP tool call by default
export const MAX_AGENT_READ_SIZE = 40_000;
