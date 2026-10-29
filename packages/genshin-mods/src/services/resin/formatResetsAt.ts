// The reset time as the reader's own clock spells it, such as a short month, day, year and time
export const formatResetsAt = (resetsAt: string): string =>
  Temporal.Instant.from(resetsAt).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" });
