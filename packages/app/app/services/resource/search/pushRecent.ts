// Most-recent-first list updater for the per-device recent searches
export const pushRecent = <T>(
  entries: readonly T[],
  entry: T,
  checkIsSame: (a: T, b: T) => boolean,
  limit: number,
): T[] => [entry, ...entries.filter((existingEntry) => !checkIsSame(existingEntry, entry))].slice(0, limit);
