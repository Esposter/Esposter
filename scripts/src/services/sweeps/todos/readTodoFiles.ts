import type { TodoFile } from "#src/models/sweeps/todos/TodoFile";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { BINARY_BYTE } from "#src/services/sweeps/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TODO_EXCLUDED_PATHSPECS } from "#src/services/sweeps/todos/constants";
import { getUnlinkedTodoLines } from "#src/services/sweeps/todos/getUnlinkedTodoLines";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const TODO_MARKER = "@TODO";
const UNFILED_TODO_MARKER = "@TODO: no upstream issue";
// Every tracked file carrying a marker, read once for both questions asked of it: the lines whose marker no link
// Follows, and whether one is in the unfiled form, which the `todos` skill lists until its issue is filed
export const readTodoFiles = (): TodoFile[] =>
  readSweepFilePaths(...TODO_EXCLUDED_PATHSPECS).flatMap((path) => {
    const contents = readFileSync(resolve(REPOSITORY_ROOT, path));
    if (!contents.includes(TODO_MARKER)) return [];

    return [
      {
        isUnfiled: contents.includes(UNFILED_TODO_MARKER),
        path,
        unlinkedLines: contents.includes(BINARY_BYTE) ? [] : getUnlinkedTodoLines(contents.toString("utf8")),
      },
    ];
  });
