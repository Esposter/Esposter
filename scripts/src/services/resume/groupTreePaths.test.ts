import { groupTreePaths } from "#src/services/resume/groupTreePaths";
import { describe, expect, test } from "vitest";

describe(groupTreePaths, () => {
  test.each([
    [[], []],
    [
      [" M apps/web/a.ts", "?? apps/web/b/c.ts", " D apps/functions/d.ts", " M package.json"],
      ["apps/web (2)", "apps/functions (1)", "package.json (1)"],
    ],
    [["R  old/x/a.ts -> new/y/a.ts"], ["new/y (1)"]],
  ])("groups %j into %j", (lines, texts) => {
    expect.hasAssertions();

    expect(groupTreePaths(lines).map(({ text }) => text)).toStrictEqual(texts);
  });
});
