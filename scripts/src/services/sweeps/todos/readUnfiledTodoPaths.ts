import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TODO_EXCLUDED_PATHSPECS } from "#src/services/sweeps/todos/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const UNFILED_TODO_MARKER = "@TODO: no upstream issue";
// Every tracked file carrying a marker in the unfiled form, which the `todos` skill lists until its issue is filed
export const readUnfiledTodoPaths = (): string[] =>
  readSweepFilePaths(...TODO_EXCLUDED_PATHSPECS).filter((path) =>
    readFileSync(resolve(REPOSITORY_ROOT, path), "utf8").includes(UNFILED_TODO_MARKER),
  );
