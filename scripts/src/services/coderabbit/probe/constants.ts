export const POLL_INTERVAL_MS: number = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");

export const DEADLINE_MS: number = Temporal.Duration.from({ minutes: 10 }).total("milliseconds");
