// The slice of a loaded list the offline cache keeps — the head of it, since that is the page a cold start
// Renders first. Read in two places for two reasons (the cache write bounds what it persists, the watch bounds
// What it has to traverse to notice a change), so which end is kept is decided here once rather than in both
// A configured limit of zero is a store that caches nothing, not a store with no limit — the two are told apart
// By the limit's absence, never by its truthiness
export const getCachedItems = <T>(items: T[], limit?: number): T[] =>
  limit === undefined ? items : items.slice(0, limit);
