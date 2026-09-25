import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { getUnlinkedTodoLines } from "#src/services/sweeps/todos/getUnlinkedTodoLines";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BINARY_BYTE = 0;
const TODO_MARKER = "@TODO";
// Prose names the marker to say how one is written, and this scan's own directory plants the violations its test
// Reports. `.claude` is the symlink to `.agents`, which the scan already walks, and reading it throws
const EXCLUDED_PATHSPECS = [":(exclude)*.md", ":(exclude)scripts/src/services/sweeps/todos", ":(exclude).claude"];
// Every tracked file, scanned, one `path:line` per marker that no link follows.
export const readUnlinkedTodoFindings = (): string[] =>
  readSweepFilePaths(...EXCLUDED_PATHSPECS).flatMap((path) => {
    const contents = readFileSync(resolve(REPOSITORY_ROOT, path));
    if (contents.includes(BINARY_BYTE) || !contents.includes(TODO_MARKER)) return [];

    return getUnlinkedTodoLines(contents.toString("utf8")).map((line) => `${path}:${line}`);
  });
