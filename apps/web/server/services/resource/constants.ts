// Autosave fires far more often than a user thinks of "I saved" — without coalescing every
// Keystroke burst would flood the partition. One entry per user per hour is the readable trail.
export const CONTENT_SAVED_COALESCE_WINDOW_MS = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
// Short-lived because the asset endpoint re-signs on every request — minutes-scale keeps a leaked url
// Nearly worthless and stays compatible with the 7-day user-delegation SAS cap
export const RESOURCE_ASSET_SAS_DURATION_MS = Temporal.Duration.from({ minutes: 15 }).total("milliseconds");
// Just under the SAS life so a browser-cached redirect can never outlive its signature
export const RESOURCE_ASSET_CACHE_MAX_AGE_SECONDS = Temporal.Duration.from({ minutes: 14 }).total("seconds");
// Bounded so a hot resource's concurrent increments cannot spin the read path; on exhaustion the count drops
// Appended to a duplicated resource's name; the base name is truncated so the whole stays within the length check
export const DUPLICATE_NAME_SUFFIX = " (copy)";
// A content update that loses to a save made in between is read again and reapplied this many times in all, and then
// The call fails rather than write over that save
export const MAX_CONTENT_UPDATE_ATTEMPTS = 3;
// The most an agent's read answers, in bytes of JSON: at a few bytes a token, well under the 25,000 tokens Claude Code
// Accepts from one MCP tool call by default
export const MAX_AGENT_READ_SIZE = 40_000;
// How long a request holds a resource's object lease before another may take it over. Long enough for one version write or
// Collection to finish, short enough that a request which crashed while holding it frees the resource within a minute
export const RESOURCE_OBJECT_LEASE_MS = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
// How long a request waits for a resource's object lease before it is refused, so a save never queues behind a holder
// For longer than the user will wait for it to finish
export const RESOURCE_OBJECT_LOCK_WAIT_MS = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");
// How long a waiting request pauses between attempts to take the lease
export const RESOURCE_OBJECT_LOCK_RETRY_MS = 100;
