// A session-scoped cache holds one entry, so it needs no key of its own — the keyed form is the general case
// And this is that form with a single, unnamed key
export const DEFAULT_CACHE_KEY = "";
// The longest the sign-out waits for other tabs to release the offline cache before its delete counts as failed
export const RESET_DATABASE_TIMEOUT_MS = Temporal.Duration.from({ seconds: 5 }).total("milliseconds");
