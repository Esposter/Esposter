// Paces waypoint-driven refetches so a permanently failing query can't spin into a hot retry loop
export const BACKOFF_BASE_DELAY_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
export const BACKOFF_MAX_DELAY_MS = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");
