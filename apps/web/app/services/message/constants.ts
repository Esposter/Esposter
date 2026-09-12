// Consecutive messages from the same author within this window render as one batch — one avatar, one header
export const SAME_BATCH_WINDOW_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
