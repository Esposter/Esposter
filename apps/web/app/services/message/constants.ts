// Consecutive messages from the same author within this window render as one batch — one avatar, one header
export const SAME_BATCH_WINDOW_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
// The soonest a message may be scheduled for, and therefore also what a picker opens on: a job the user
// Confirms without touching the picker still runs in the future.
export const SCHEDULE_LEAD_TIME_MS = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
