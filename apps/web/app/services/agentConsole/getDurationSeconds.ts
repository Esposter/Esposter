// Milliseconds as whole tenths of a second, the precision a timeline row shows
export const getDurationSeconds = (durationMs: number) =>
  Temporal.Duration.from({ milliseconds: Math.round(durationMs) })
    .total("seconds")
    .toFixed(1);
