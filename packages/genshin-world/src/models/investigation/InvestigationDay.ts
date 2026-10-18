// The game day's investigations: how many were made, and the moment the day's count began, the key the day is read by
// Against the daily reset. No key until the day's first investigation
export interface InvestigationDay {
  count: number;
  dayKey: Temporal.Instant | undefined;
}
