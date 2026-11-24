import type { WakeRecord } from "#src/models/WakeRecord";

// The watched procedures no record calls.
// Every record lists the same watched procedures, since each names the app's router.
export const getWakeGaps = (records: WakeRecord[]): string[] => {
  const called = new Set(records.flatMap((record) => record.called));
  return (records[0]?.watched ?? []).filter((path) => !called.has(path)).toSorted();
};
