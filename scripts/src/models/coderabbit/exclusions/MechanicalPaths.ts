import type { NameStatusRow } from "#src/models/coderabbit/exclusions/NameStatusRow";

// What a range's diff proves about each file, read once for whichever caller asks — the express lane's
// Per-commit proof and the manual exclusions command classify the same way and differ only in what they do
// With a file that fails
export interface MechanicalPaths {
  // The subset whose content did not meaningfully change: a 100% rename, or a diff that is nothing but import
  // Specifiers following a move
  mechanicalPaths: Set<string>;
  // Every file the range changed, at the path it ends at and with the one it came from
  rows: NameStatusRow[];
}
