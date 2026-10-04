import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackageDirectories } from "#src/services/shared/readWorkspacePackageDirectories";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Two hand-kept inventories list the workspace's members on purpose: the agent guide pairs each path with its npm
 * name, and the root README pairs it with a repository link. A member added to the workspace and to only one of
 * them reads as complete from either file alone, so both are held to the one list pnpm reads.
 */
describe("packageInventories", () => {
  const packageDirectories = readWorkspacePackageDirectories(REPOSITORY_ROOT);

  test.each(["AGENTS.md", "README.md"])("%s names every workspace member", (filename) => {
    expect.hasAssertions();

    const text = readFileSync(resolve(REPOSITORY_ROOT, filename), "utf8");
    // A table cell holding the path whole, so `packages/db` is not answered by `packages/db-schema`'s row
    const unnamedPackageDirectories = packageDirectories.filter(
      (packageDirectory) => !text.includes(`\`${packageDirectory}\``),
    );

    expect(unnamedPackageDirectories).toStrictEqual([]);
  });
});
