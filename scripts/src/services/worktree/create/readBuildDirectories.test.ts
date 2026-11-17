import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { RUNTIME_PACKAGE_DIRECTORIES } from "#src/services/worktree/create/constants";
import { readBuildDirectories } from "#src/services/worktree/create/readBuildDirectories";
import { describe, expect, test } from "vitest";

describe(readBuildDirectories, () => {
  test("a named package builds its own directory", () => {
    expect.hasAssertions();

    expect(readBuildDirectories(REPOSITORY_ROOT, ["genshin-world"])).toStrictEqual([
      ...RUNTIME_PACKAGE_DIRECTORIES,
      "genshin-world",
    ]);
  });

  test("a named app builds the packages rather than itself", () => {
    expect.hasAssertions();

    expect(readBuildDirectories(REPOSITORY_ROOT, ["@esposter/web"])).toStrictEqual([
      ...RUNTIME_PACKAGE_DIRECTORIES,
      "packages",
    ]);
  });
});
