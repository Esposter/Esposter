import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const UNFILED_TODO_MARKER = "@TODO: no upstream issue";
// Every tracked file carrying a marker in the unfiled form, which the `todos` skill lists until its issue is filed.
// Prose and this scan's own directory name the form without being a marker, as in the unlinked scan
export const readUnfiledTodoPaths = (): string[] =>
  readSweepFilePaths(":(exclude)*.md", ":(exclude)scripts/src/services/sweeps/todos", ":(exclude).claude").filter(
    (path) => readFileSync(resolve(REPOSITORY_ROOT, path), "utf8").includes(UNFILED_TODO_MARKER),
  );
