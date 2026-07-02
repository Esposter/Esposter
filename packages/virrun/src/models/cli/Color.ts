// An ANSI style virrun paints its stderr banners with. Values are the human style name so a Color reads clearly in a
// Stack trace or config; colorize maps each to its SGR open/close pair. colorize is a no-op when color is off (a pipe,
// NO_COLOR, or vitest), so every line degrades to plain text automatically.
//
// SEMANTIC PALETTE — the one place the CLI's color vocabulary is decided, so every call site picks by meaning, not by
// Eye. Route every diagnostic line through formatVirrunLine (the shared `[virrun]` tag) and colorize its moving parts
// Per the roles below. Keep this coherent: a new line should reuse an existing role, not introduce a new mapping.
//
// - Cyan  — the `[virrun]` brand tag only (always Bold-combined via formatVirrunLine); nothing else is cyan.
// - Bold  — emphasis, only combined with the tag.
// - Yellow— commands / argv / executables / actionable flags (`--force`), and the "expect a wait" one-time-install
//           Notice. What the user typed or should type.
// - Blue  — concrete values & locations: file/dir paths, backend type, lockfile hash, counts. The nouns of a line.
// - Green — success & positive state: exit 0, "present", durations, node version.
// - Red   — failure & destructive: errors, a non-zero exit, "absent", and a path being REMOVED (destruction outranks
//           The plain path=Blue rule).
// - Dim   — routine auto-emitted metadata & absence only: the snapshot-reuse notice, the doctor note column, and
//           "none"/"n/a". Never dim a path or other primary content — dim means "background noise you can skip".
export enum Color {
  Blue = "blue",
  Bold = "bold",
  Cyan = "cyan",
  Dim = "dim",
  Green = "green",
  Red = "red",
  Yellow = "yellow",
}
