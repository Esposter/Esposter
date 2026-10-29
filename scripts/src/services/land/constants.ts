// The landing tries its pull and push this many times, since each try loses a race only to another session's push
export const MAX_LANDING_ATTEMPTS = 5;
// The exit status of a landing: 0 landed, 1 the precheck found something to fix, 2 a rebase met a conflict its author
// Settles, 3 the main checkout has no built configuration to run the barrel check with
export const LANDING_EXIT_STATUS = { conflicted: 2, distributionMissing: 3, landed: 0, precheckFailed: 1 } as const;
// The short wait before a retry, long enough for the session that won the race to finish writing its ref
export const PUSH_RETRY_MILLISECONDS: number = Temporal.Duration.from({ seconds: 2 }).total("milliseconds");
