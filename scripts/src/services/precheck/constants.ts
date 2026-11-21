// An export line a barrel generator writes for a module in a subdirectory, which the path between `./` and the file names,
// Nested directories included, since a package's lazy directory can be one (`services/character/avatar`). A source barrel
// Line is `export *`, and a component barrel line is the component's default export
export const EXPORT_LINE_DIRECTORY_REGEX: RegExp =
  /^export (?:\*|\{ default as \S+ \}) from "\.\/(?<directory>.+)\/[^/"]+";$/u;
// What the dependency graph is drawn from: a member's manifest, which names its siblings, the workspace file that lists the
// Members and the catalog they resolve from, and the generator that draws them
export const GRAPH_INPUT_REGEX: RegExp =
  /^(?:(?:.+\/)?package\.json|pnpm-workspace\.yaml|scripts\/src\/(?:models|services)\/dependencyGraph\/.+)$/u;
