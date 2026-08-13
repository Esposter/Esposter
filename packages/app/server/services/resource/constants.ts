import { dayjs } from "#shared/services/dayjs";

// Trigram similarity is the fraction of trigrams two strings share. pg_trgm's own default cutoff
// Is the sweet spot: "survye" still finds "Survey" without unrelated names leaking into results.
export const SEARCH_SIMILARITY_THRESHOLD = 0.3;

// Autosave fires far more often than a user thinks of "I saved" — without coalescing every
// Keystroke burst would flood the partition. One entry per user per hour is the readable trail.
export const CONTENT_SAVED_COALESCE_WINDOW_MS = dayjs.duration(1, "hour").asMilliseconds();

// Short-lived because the asset endpoint re-signs on every request — minutes-scale keeps a leaked url
// Nearly worthless and stays compatible with the 7-day user-delegation SAS cap
export const RESOURCE_ASSET_SAS_DURATION = dayjs.duration(15, "minutes");

// Just under the SAS life so a browser-cached redirect can never outlive its signature
export const RESOURCE_ASSET_CACHE_MAX_AGE_SECONDS = RESOURCE_ASSET_SAS_DURATION.subtract(
  dayjs.duration(1, "minute"),
).asSeconds();

// Bounded so a hot resource's concurrent increments cannot spin the read path; on exhaustion the count drops
export const MAX_VIEW_COUNT_ETAG_RETRIES = 3;
