import { getUnnamedMemberPaths } from "#src/services/workspace/getUnnamedMemberPaths";
import { describe, expect, test } from "vitest";

describe(getUnnamedMemberPaths, () => {
  const memberPath = "packages/db";
  // Names the member only as the lead of a deeper path
  const text = "`packages/db/src/index.ts`";

  test.each([
    [false, [memberPath]],
    [true, []],
  ])("a deeper path names its member only when allowDeeperPaths is %s", (allowDeeperPaths, unnamedMemberPaths) => {
    expect.hasAssertions();

    expect(getUnnamedMemberPaths(text, [memberPath], { allowDeeperPaths })).toStrictEqual(unnamedMemberPaths);
  });
});
