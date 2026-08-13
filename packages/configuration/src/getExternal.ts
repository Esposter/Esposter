import { readFileSync } from "node:fs";

// Workspace packages published under their bare name, so the `@esposter/` scope pattern can't cover them.
const UNSCOPED_WORKSPACE_PACKAGES = ["azure-mock", "parse-tmx", "virrun", "vue-phaserjs"];
const REGEX_METACHARACTERS_REGEX = /[$()*+.?[\\\]^{|}]/gu;
// A bare name never matches a subpath import, and plenty of externals are only ever reached through one
// (`drizzle-orm/pg-core`, `@electric-sql/pglite/contrib/pg_trgm`, `vitest/node`), so every entry externalizes
// The package and everything under it.
const getPackagePattern = (name: string): RegExp =>
  new RegExp(`^${name.replaceAll(REGEX_METACHARACTERS_REGEX, String.raw`\$&`)}(?:/|$)`, "u");

// What a library externalizes is exactly what it does not bundle: its own `peerDependencies` — the contract the
// Consumer supplies — plus every workspace sibling. Deriving both from the calling package's own manifest
// (rolldown runs with that package as cwd) keeps the two in lockstep, so a newly declared peer can never be
// Silently vendored into the bundle the way a forgotten entry in a hand-maintained list was.
export const getExternal = (dependencyField: "devDependencies" | "peerDependencies" = "peerDependencies"): RegExp[] => {
  // eslint-disable-next-line no-restricted-syntax -- a package manifest carries no dates, and configuration builds before @esposter/shared so it cannot import jsonDateParse
  const manifest = JSON.parse(readFileSync("package.json", "utf8")) as Partial<
    Record<typeof dependencyField, Record<string, string>>
  >;
  return [
    /^@esposter\//u,
    ...UNSCOPED_WORKSPACE_PACKAGES.map((name) => getPackagePattern(name)),
    ...Object.keys(manifest[dependencyField] ?? {}).map((name) => getPackagePattern(name)),
  ];
};
