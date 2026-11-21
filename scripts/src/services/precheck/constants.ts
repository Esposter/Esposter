/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands this annotation */
import { BARREL_FILE, SOURCE_DIRECTORY_NAME } from "@esposter/configuration/constants";

// An export line a barrel generator writes for a module in a subdirectory, which the path between `./` and the file names,
// Nested directories included, since a package's lazy directory can be one (`services/character/avatar`). A source barrel
// Line is `export *`, and a component barrel line is the component's default export
export const EXPORT_LINE_DIRECTORY_REGEX: RegExp =
  /^export (?:\*|\{ default as \S+ \}) from "\.\/(?<directory>.+)\/[^/"]+";$/u;
// The line a package's `.gitignore` holds to commit the `src/index.ts` it writes by hand, against the root ignore of barrels
export const HAND_WRITTEN_ENTRY_LINE = `!/${SOURCE_DIRECTORY_NAME}/${BARREL_FILE}`;
// What the dependency graph is drawn from: a member's manifest, which names its siblings, the workspace file that lists the
// Members and the catalog they resolve from, and the generator that draws them
export const GRAPH_INPUT_REGEX: RegExp =
  /^(?:(?:.+\/)?package\.json|pnpm-workspace\.yaml|scripts\/src\/(?:models|services)\/dependencyGraph\/.+)$/u;
