import type { SourceWordEntry } from "#src/models/sweeps/staleNames/SourceWordEntry";

// What the stale-names scan keeps between runs: the generated patterns it was written under, the version of what a word
// Is, each source file's entry keyed by its path, and the union of their words and of their code's words. A tree none
// Of whose files has changed takes its names from those unions without walking every entry
export interface SourceWordCache {
  codeWords: string[];
  entries: Record<string, SourceWordEntry>;
  generatedPatterns: string[];
  version: number;
  words: string[];
}
