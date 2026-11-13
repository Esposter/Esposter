import type { TodoFile } from "#src/models/sweeps/todos/TodoFile";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readTodoFiles } from "#src/services/sweeps/todos/readTodoFiles";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, test } from "vitest";

/**
 * The `todos` skill's rule — a TODO marker is a workaround for something outside the repository, followed by the
 * link to the thing that ends it — held over every tracked file. A marker naming a condition in words is one nobody
 * can check: it reads the same the day the condition is met as the day it was written, and the one it names most
 * often is work of our own, which is either done now or an issue.
 */
describe("todos", () => {
  // One listing and one read of the tree answer both tests
  let todoFiles: TodoFile[] = [];

  beforeAll(() => {
    todoFiles = readTodoFiles();
  }, TREE_READ_TIMEOUT_MS);

  test("every marker in a tracked file is followed by a link", () => {
    expect.hasAssertions();

    expect(
      todoFiles.flatMap(({ path, unlinkedLines }) => unlinkedLines.map((line) => `${path}:${line}`)),
    ).toStrictEqual([]);
  });

  // The list is where the reminder to file each issue lives, so a marker missing from it is never filed and a row
  // Whose marker went is a reminder for nothing
  test("lists every marker with no upstream issue, and nothing else", () => {
    expect.hasAssertions();

    const skill = readFileSync(resolve(REPOSITORY_ROOT, ".agents/skills/todos/SKILL.md"), "utf8");
    const listedPaths = Array.from(
      skill.slice(skill.indexOf("## Unfiled upstream issues")).matchAll(/^- `(?<path>[^`]+)`/gmu),
      ({ groups }) => groups?.path ?? "",
    );

    expect(listedPaths.toSorted((firstPath, secondPath) => firstPath.localeCompare(secondPath))).toStrictEqual(
      todoFiles
        .filter(({ isUnfiled }) => isUnfiled)
        .map(({ path }) => path)
        .toSorted((firstPath, secondPath) => firstPath.localeCompare(secondPath)),
    );
  });
});
