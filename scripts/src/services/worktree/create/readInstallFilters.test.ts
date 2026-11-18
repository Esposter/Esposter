import { readInstallFilters } from "#src/services/worktree/create/readInstallFilters";
import { describe, expect, test } from "vitest";

describe(readInstallFilters, () => {
  test("selects the scripts package and the packages named with their closures, and the app itself for its dependencies", () => {
    expect.hasAssertions();

    expect(readInstallFilters(["named"])).toStrictEqual([
      "--filter",
      "@esposter/scripts...",
      "--filter",
      "named...",
      "--filter",
      "@esposter/web",
    ]);
  });
});
