import type { SourceWordEntry } from "#src/models/sweeps/staleNames/SourceWordEntry";

// What the stale-names scan keeps between runs: the generated patterns it was written under, each source file's entry
// Keyed by its path, and the union of their words. A tree none of whose files has changed takes its names from `words`
// Without walking every entry
export interface SourceWordCache {
  entries: Record<string, SourceWordEntry>;
  generatedPatterns: string[];
  words: string[];
}
