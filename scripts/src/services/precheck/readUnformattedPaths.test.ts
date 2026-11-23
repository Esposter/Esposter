import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { GENERATED_PATH, OUTSIDE_PATH, UNPARSABLE_PATH, UNPARSABLE_SOURCE } from "#src/services/format/constants.test";
import { setupFormatterTree } from "#src/services/format/setupFormatterTree.test";
import { readUnformattedPaths } from "#src/services/precheck/readUnformattedPaths";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(readUnformattedPaths, () => {
  const getRoot = setupFormatterTree();

  test("flags the changed file the formatter would rewrite, and not a generated one", () => {
    expect.hasAssertions();

    const changedFiles = [
      { path: GENERATED_PATH, status: ChangeStatus.Modified },
      { path: OUTSIDE_PATH, status: ChangeStatus.Modified },
    ];

    expect(readUnformattedPaths(changedFiles, getRoot(), REPOSITORY_ROOT)).toStrictEqual([OUTSIDE_PATH]);
  });

  test("stops with the formatter's own message for the one file it cannot parse, checked in a run with good files", () => {
    expect.hasAssertions();

    const root = getRoot();
    writeFileSync(join(root, UNPARSABLE_PATH), UNPARSABLE_SOURCE);
    const changedFiles = [
      { path: OUTSIDE_PATH, status: ChangeStatus.Modified },
      { path: UNPARSABLE_PATH, status: ChangeStatus.Modified },
    ];

    expect(() => readUnformattedPaths(changedFiles, root, REPOSITORY_ROOT)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: packages/example/src/kit/Broken.ts, x Unexpected token]`,
    );
  });
});
