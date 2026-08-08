// Most-recent-first list updater for the per-device recent searches
export const pushRecent = (entries: readonly string[], entry: string, limit: number): string[] =>
  [entry, ...entries.filter((existingEntry) => existingEntry !== entry)].slice(0, limit);
