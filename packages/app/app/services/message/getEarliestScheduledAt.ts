// The soonest a message may be scheduled for, and therefore also what a picker opens on: a job the user
// Confirms without touching the picker still runs in the future.
const SCHEDULE_LEAD_TIME_MS = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");

export const getEarliestScheduledAt = (): Date => new Date(Date.now() + SCHEDULE_LEAD_TIME_MS);
