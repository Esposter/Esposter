import type { TodoMarker } from "#src/models/sweeps/todos/TodoMarker";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { BINARY_BYTE } from "#src/services/sweeps/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TODO_EXCLUDED_PATHSPECS } from "#src/services/sweeps/todos/constants";
import { getTodoMarkers } from "#src/services/sweeps/todos/getTodoMarkers";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const TODO_MARKER = "@TODO";
// Every marker in a tracked text file, read once for each question asked of them: the `todos` skill's test and the
// Report on what their links say now
export const readTodoMarkers = (): TodoMarker[] =>
  readSweepFilePaths(...TODO_EXCLUDED_PATHSPECS).flatMap((path) => {
    const contents = readFileSync(resolve(REPOSITORY_ROOT, path));
    if (!contents.includes(TODO_MARKER) || contents.includes(BINARY_BYTE)) return [];
    return getTodoMarkers(contents.toString("utf8")).map((marker) => ({ ...marker, path }));
  });
