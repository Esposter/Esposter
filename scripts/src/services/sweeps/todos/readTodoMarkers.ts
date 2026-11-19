import type { TodoMarker } from "#src/models/sweeps/todos/TodoMarker";

import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { TODO_EXCLUDED_PATHSPECS } from "#src/services/sweeps/todos/constants";
import { getTodoMarkers } from "#src/services/sweeps/todos/getTodoMarkers";
import { getResult } from "@esposter/shared";

const TODO_MARKER = "@TODO";
// `git grep` exits 1 when nothing matches, which for the markers is the tree with no workaround left
const NO_MATCH_EXIT_STATUS = 1;
const GREP_LINE_REGEX = /^(?<path>[^:]+):(?<line>\d+):(?<text>.*)$/u;
// Every marker in a tracked or untracked text file, read off `git grep`'s matching lines alone, so the cost follows the
// Markers rather than the size of the tree
export const readTodoMarkers = (): TodoMarker[] =>
  getResult(() =>
    runGit(["grep", "--untracked", "-I", "-n", "--fixed-strings", TODO_MARKER, "--", ".", ...TODO_EXCLUDED_PATHSPECS]),
  ).match(
    (output) =>
      getNonEmptyLines(output).flatMap((grepLine) => {
        const { line, path, text } = GREP_LINE_REGEX.exec(grepLine)?.groups ?? {};
        if (line === undefined || path === undefined || text === undefined) return [];
        return getTodoMarkers(text).map((marker) => ({ ...marker, line: Number(line), path }));
      }),
    (error) => {
      if (error instanceof Error && "status" in error && error.status === NO_MATCH_EXIT_STATUS) return [];
      throw error;
    },
  );
