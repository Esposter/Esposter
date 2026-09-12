// Where a specifier was declared, which decides what its resolution is checked against: the two workspace
// Sections against the lockfile, and `engines` against the registry. The first two double as the yaml keys.
export enum DependencyGroup {
  Catalog = "catalog",
  ConfigDependencies = "configDependencies",
  Engines = "engines",
}
