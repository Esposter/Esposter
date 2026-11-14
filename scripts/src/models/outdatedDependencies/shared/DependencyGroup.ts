// Where a specifier was declared, which decides what its resolution is checked against: the two workspace
// Sections against `pnpm-lock.yaml`, `engines`, `packageManager`, `.node-version` and the workspace's own
// `overrides` against the registry, and a manifest npm installs — one with an Npm lockfile beside it, a Claude Code
// Plugin's — against that lockfile and then the registry, since `pnpm` never reads the lockfile its install runs
// From. An action a workflow uses and the runner it runs on are each asked of the source that publishes them. The two
// Workspace sections and `overrides` double as the yaml keys.
export enum DependencyGroup {
  Catalog = "catalog",
  ConfigDependencies = "configDependencies",
  Engines = "engines",
  GitHubActions = "github-actions",
  GitHubRunners = "github-runners",
  NodeVersion = ".node-version",
  Npm = "npm",
  Overrides = "overrides",
  PackageManager = "packageManager",
}
