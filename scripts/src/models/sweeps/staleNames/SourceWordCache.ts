import type { SourceWordEntry } from "#src/models/sweeps/staleNames/SourceWordEntry";

// What the stale-names scan keeps between runs: the generated patterns it was written under, the version of what a word
// Is, each source file's entry keyed by its path, and the union of their code's words. A tree none of whose files has
// Changed takes its names from that union without walking every entry
export interface SourceWordCache {
  codeWords: string[];
  entries: Record<string, SourceWordEntry>;
  generatedPatterns: string[];
  version: number;
}
