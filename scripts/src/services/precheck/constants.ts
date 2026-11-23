// An export line a barrel generator writes for a module in a subdirectory, which the path between `./` and the file
// Names, Nested directories included, since a package's lazy directory can be one (`services/character/avatar`). A
// Source barrel Line is `export *`, and a component barrel line is the component's default export
export const EXPORT_LINE_DIRECTORY_REGEX = /^export (?:\*|\{ default as \S+ \}) from "\.\/(?<directory>.+)\/[^/"]+";$/u;
// What the dependency graph is drawn from: a member's manifest, which names its siblings, the workspace file that lists
// The Members and the catalog they resolve from, and the generator that draws them
export const GRAPH_INPUT_REGEX =
  /^(?:(?:.+\/)?package\.json|pnpm-workspace\.yaml|scripts\/src\/(?:models|services)\/dependencyGraph\/.+)$/u;
// The finding that closes a stale generated file's findings with the command the precheck writes it with, `--fix`
export const PRECHECK_FIX_FINDING = "fix: pnpm ai:precheck --fix";
