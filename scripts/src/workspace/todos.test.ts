import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readUnfiledTodoPaths } from "#src/services/sweeps/todos/readUnfiledTodoPaths";
import { readUnlinkedTodoFindings } from "#src/services/sweeps/todos/readUnlinkedTodoFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The `todos` skill's rule — a TODO marker is a workaround for something outside the repository, followed by the
 * link to the thing that ends it — held over every tracked file. A marker naming a condition in words is one nobody
 * can check: it reads the same the day the condition is met as the day it was written, and the one it names most
 * often is work of our own, which is either done now or an issue.
 */
describe("todos", () => {
  test("every marker in a tracked file is followed by a link", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(readUnlinkedTodoFindings()).toStrictEqual([]);
  });

  // The list is where the reminder to file each issue lives, so a marker missing from it is never filed and a row
  // Whose marker went is a reminder for nothing
  test("lists every marker with no upstream issue, and nothing else", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    const skill = readFileSync(resolve(REPOSITORY_ROOT, ".agents/skills/todos/SKILL.md"), "utf8");
    const listedPaths = Array.from(
      skill.slice(skill.indexOf("## Unfiled upstream issues")).matchAll(/^- `(?<path>[^`]+)`/gmu),
      ({ groups }) => groups?.path ?? "",
    );

    expect(listedPaths.toSorted((left, right) => left.localeCompare(right))).toStrictEqual(
      readUnfiledTodoPaths().toSorted((left, right) => left.localeCompare(right)),
    );
  });
});
