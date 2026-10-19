import type { PackageManifest } from "@esposter/configuration";

import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
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

  test("the root README marks each member published exactly when its manifest is not private", () => {
    expect.hasAssertions();

    const lines = readFileSync(resolve(REPOSITORY_ROOT, "README.md"), "utf8").split("\n");
    const mismatches = packageDirectories.flatMap((packageDirectory) => {
      // A member with no row is the test above's concern, so it is skipped here
      const row = lines.find((line) => line.split("|")[1]?.includes(`\`${packageDirectory}\``));
      if (!row) return [];

      const manifest = parseMachineJson<PackageManifest>(
        readFileSync(resolve(REPOSITORY_ROOT, packageDirectory, PACKAGE_JSON_FILENAME), "utf8"),
      );
      const publishedCell = row.split("|").at(-2)?.trim();
      return publishedCell === (manifest.private ? "—" : "✓") ? [] : [`${packageDirectory}: ${publishedCell}`];
    });

    expect(mismatches).toStrictEqual([]);
  });
});
