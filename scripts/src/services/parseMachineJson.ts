// Parse a repo document — a package manifest, a tsconfig, a probe's machine-readable line — with NO date reviver,
// For a caller that reads its own fields. "It carries no dates" is not the reason and never was
// (/docs/architecture/serialization.md): the reason is that every string in one of these is a directory name, a
// Repo-relative path, a glob or a script body — free-form text a person chose, which is exactly what a reviver
// Guesses wrong about. A directory legitimately called `2026-08-05T12:00:00Z` would arrive as a `Date` where the
// Reading code declared a string, failing a whole walk over one name. One helper for `scripts/`, so the exception
// Lives in a single place rather than being re-argued at each call site.
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const parseMachineJson = <TValue = unknown>(json: string): TValue =>
  // oxlint-disable-next-line no-restricted-properties -- the one sanctioned plain parse for this tree
  JSON.parse(json);
