import { GENERATED_PATH, OUTSIDE_PATH } from "#src/services/format/constants.test";
import { setupFormatterTree } from "#src/services/format/setupFormatterTree.test";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { readUnformattedPaths } from "#src/services/precheck/readUnformattedPaths";
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
});
