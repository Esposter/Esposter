import { dayjs } from "#shared/services/dayjs";

// Trigram similarity is the fraction of trigrams two strings share. pg_trgm's own default cutoff
// Is the sweet spot: "survye" still finds "Survey" without unrelated names leaking into results.
export const SEARCH_SIMILARITY_THRESHOLD = 0.3;

// Autosave fires far more often than a user thinks of "I saved" — without coalescing every
// Keystroke burst would flood the partition. One entry per user per hour is the readable trail.
export const CONTENT_SAVED_COALESCE_WINDOW_MS = dayjs.duration(1, "hour").asMilliseconds();
