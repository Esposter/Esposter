// How long a delivered notification stays readable. Bounded on purpose: a row is written per recipient and
// Nothing else ever deletes it, so an unbounded bell is a table that only grows. The trim rides the write path,
// Where the recipients are already known and the delete is one indexed statement.
export const NOTIFICATION_RETENTION_MS = Temporal.Duration.from({ days: 30 }).total("milliseconds");
