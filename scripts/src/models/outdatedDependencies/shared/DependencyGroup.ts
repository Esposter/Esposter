// Where a specifier was declared, which decides what its resolution is checked against: the two workspace
// Sections against `pnpm-lock.yaml`, `engines` and `packageManager` against the registry, and a manifest npm installs — one with an
// Npm lockfile beside it, a Claude Code plugin's — against that lockfile and then the registry, since `pnpm` never
// Reads the lockfile its install runs from. The first two double as the yaml keys.
export enum DependencyGroup {
  Catalog = "catalog",
  ConfigDependencies = "configDependencies",
  Engines = "engines",
  Npm = "npm",
  PackageManager = "packageManager",
}
