import { AGENTS_FILE, README_FILE } from "#src/services/package/new/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { getUnnamedMemberPaths } from "#src/services/workspace/getUnnamedMemberPaths";
import { readRepositoryFile } from "#src/workspace/readRepositoryFile.test";
import { describe, expect, test } from "vitest";

/**
 * Two hand-kept inventories list the workspace's members on purpose: the agent guide pairs each path with its npm
 * name, and the root README pairs it with a repository link. A member added to the workspace and to only one of
 * them reads as complete from either file alone, so both are held to the one list pnpm reads.
 */
describe("packageInventories", () => {
  const workspacePackages = readWorkspacePackages(REPOSITORY_ROOT).map(
    ({ directory, manifest, workspaceDirectory }) => ({
      manifest,
      path: workspaceDirectory ? `${workspaceDirectory}/${directory}` : directory,
    }),
  );

  test.each([AGENTS_FILE, README_FILE])("%s names every workspace member", (filename) => {
    expect.hasAssertions();

    const unnamedPackagePaths = getUnnamedMemberPaths(
      readRepositoryFile(filename),
      workspacePackages.map(({ path }) => path),
    );

    expect(unnamedPackagePaths).toStrictEqual([]);
  });

  test("the root README marks each member published exactly when its manifest is not private", () => {
    expect.hasAssertions();

    const lines = readRepositoryFile(README_FILE).split("\n");
    const mismatches = workspacePackages.flatMap(({ manifest, path }) => {
      const row = lines.find((line) => line.split("|")[1]?.includes(`\`${path}\``));
      if (!row) return [`${path}: no row`];

      const publishedCell = row.split("|").at(-2)?.trim();
      return publishedCell === (manifest.private ? "—" : "✓") ? [] : [`${path}: ${publishedCell}`];
    });

    expect(mismatches).toStrictEqual([]);
  });
});
