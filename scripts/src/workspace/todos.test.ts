import { readTodoMarkers } from "#src/services/sweeps/todos/readTodoMarkers";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

/**
 * The `todos` skill's rule — a TODO marker is a workaround for something outside the repository, followed by the
 * link to the thing that ends it — held over every tracked file. A marker naming a condition in words is one nobody
 * can check: it reads the same the day the condition is met as the day it was written, and the one it names most
 * often is work of our own, which is either done now or an issue.
 */
describe("todos", () => {
  test(
    "every marker in a tracked file is followed by a link",
    () => {
      expect.hasAssertions();

      expect(
        readTodoMarkers()
          // oxlint-disable-next-line selector-ban/no-restricted-syntax -- a todo's url, empty when unfiled
          .filter(({ isUnfiled, url }) => !isUnfiled && url === "")
          .map(({ line, path }) => `${path}:${line}`),
      ).toStrictEqual([]);
    },
    TREE_READ_TIMEOUT_MS,
  );
});
