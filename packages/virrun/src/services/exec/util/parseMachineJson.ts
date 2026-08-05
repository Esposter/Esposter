// Parse machine-generated JSON — a probe's stdout, an on-disk cache or manifest, a package manifest — with NO date
// Reviver, for a caller that validates the result itself. None of these documents carries a date (a timestamp in one
// Is a number, `storedAtMs`), while their string fields are repo-relative paths, symlink targets and exclude patterns:
// Free-form text whose shape a reviver can only guess at, and guess wrong. A path that IS an ISO datetime
// (`2026-08-05T12:00:00Z`, a legal filename on Linux) would revive into a Date that the reading schema's `z.string()`
// Then rejects — one filename failing an entire read, and on the write-back path discarding every file a finished
// Command wrote. Same rule as the resource content blobs: the schema owns coercion, so the parse must not guess
// (/docs/architecture/serialization.md).
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const parseMachineJson = <TValue = unknown>(json: string): TValue =>
  // eslint-disable-next-line no-restricted-syntax -- machine JSON holds no dates, and its path-valued strings are exactly what a reviver corrupts
  JSON.parse(json);
