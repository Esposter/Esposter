const REGEX_METACHARACTERS_REGEX = /[$()*+.?[\\\]^{|}]/gu;

// A bare package name never matches a subpath import, and plenty of packages are only ever reached through one
// (`drizzle-orm/pg-core`, `@electric-sql/pglite/contrib/pg_trgm`, `vitest/node`), so every entry has to match
// The package and everything under it. A list of names given to `deps` verbatim silently misses exactly those.
export const getPackagePatterns = (names: string[]): RegExp[] =>
  names.map((name) => new RegExp(`^${name.replaceAll(REGEX_METACHARACTERS_REGEX, String.raw`\$&`)}(?:/|$)`, "u"));
