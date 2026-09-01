// The manifest fields a dependency specifier can appear under. `engines` is not one of them: it pins a runtime
// Rather than a package, and it is checked against the registry rather than against the catalog.
export const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
] as const;
// How far apart two versions are, ordered so the difference of two levels sorts the more urgent bump first. The
// Values are compared and subtracted as the numbers they are, never passed around as a type, so a record says
// What an enum would without asking every caller to name it.
export const VersionChangeLevel = { major: 2, minor: 1, patch: 0 } as const;

export const REGISTRY_CONCURRENCY = 4;
