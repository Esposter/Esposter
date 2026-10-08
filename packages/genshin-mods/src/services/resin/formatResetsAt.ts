// The reset time as the reader's own clock spells it, such as `Oct 8, 2026, 5:00 PM`
export const formatResetsAt = (resetsAt: string): string =>
  Temporal.Instant.from(resetsAt).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" });
