// A reminder whose send failed is retried after this long. It is the object's alarm's own retry, not a queue's
export const TODO_REMINDER_RETRY_DELAY_MS = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
