// The manifest fields a dependency specifier can appear under. `engines` is not one of them: it pins a runtime
// Rather than a package, and it is checked against the registry rather than against the catalog.
export const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
] as const;
// How far apart two versions are, ordered so the difference of two levels sorts the more urgent bump first — a
// Sort subtracts them, so the levels are the numbers rather than a set of labels with an ordering beside it. The
// Value and the type share the name, so a caller reads and returns `VersionChangeLevel` as it would an enum.
export const VersionChangeLevel = { major: 2, minor: 1, patch: 0 } as const;

export type VersionChangeLevel = (typeof VersionChangeLevel)[keyof typeof VersionChangeLevel];

export const REGISTRY_CONCURRENCY = 4;
