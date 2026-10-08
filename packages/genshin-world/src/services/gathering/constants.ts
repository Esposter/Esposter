// A local specialty comes back this long after it is picked, as the wiki gives it
export const SPECIALTY_RESPAWN_DURATION: Temporal.Duration = Temporal.Duration.from({ hours: 46 });
// How often the open world looks at the clock for a picked point that has come back, which it reads at each look
export const GATHERING_CLOCK_INTERVAL_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
