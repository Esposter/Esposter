// Shared most-recent-first list updater for recent searches and recently viewed resources
export const pushRecent = <T>(
  entries: readonly T[],
  entry: T,
  checkIsSame: (a: T, b: T) => boolean,
  limit: number,
): T[] => [entry, ...entries.filter((existingEntry) => !checkIsSame(existingEntry, entry))].slice(0, limit);
