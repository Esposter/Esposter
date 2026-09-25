import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TODO_EXCLUDED_PATHSPECS } from "#src/services/sweeps/todos/constants";
import { getUnlinkedTodoLines } from "#src/services/sweeps/todos/getUnlinkedTodoLines";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BINARY_BYTE = 0;
const TODO_MARKER = "@TODO";
// Every tracked file, scanned, one `path:line` per marker that no link follows.
export const readUnlinkedTodoFindings = (): string[] =>
  readSweepFilePaths(...TODO_EXCLUDED_PATHSPECS).flatMap((path) => {
    const contents = readFileSync(resolve(REPOSITORY_ROOT, path));
    if (contents.includes(BINARY_BYTE) || !contents.includes(TODO_MARKER)) return [];

    return getUnlinkedTodoLines(contents.toString("utf8")).map((line) => `${path}:${line}`);
  });
