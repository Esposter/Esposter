import type { WorkspacePackage } from "#src/models/shared/WorkspacePackage";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { checkIsHeadlessPackage } from "#src/services/workspace/checkIsHeadlessPackage";
import { getHeadlessPackageFailures } from "#src/services/workspace/getHeadlessPackageFailures";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A headless package is a Vue package with one entry, and it leaves its stores to the app. The rule is stated once, in
 * `getHeadlessPackageFailures`, and this holds every package that calls itself headless to it. Which packages those
 * are is decided by their own name or keyword, never by a list kept here.
 */
describe("headlessPackages", () => {
  const SOURCE_DIRECTORY = "src";
  const SOURCE_FILE_PATTERN = /\.(?:ts|vue)$/u;
  const TEST_FILE_PATTERN = /\.test(?:-d)?\.ts$/u;
  // A package's own tests may import what its source must not, since they are never shipped
  const readSourceFiles = ({ directory, workspaceDirectory }: WorkspacePackage) => {
    const sourceDirectory = join(REPOSITORY_ROOT, workspaceDirectory, directory, SOURCE_DIRECTORY);
    return readdirSync(sourceDirectory, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && SOURCE_FILE_PATTERN.test(entry.name) && !TEST_FILE_PATTERN.test(entry.name))
      .map(({ name, parentPath }) => {
        const path = join(parentPath, name);
        return { path, text: readFileSync(path, "utf8") };
      });
  };

  test("follow the package shape", () => {
    expect.hasAssertions();

    const failures = readWorkspacePackages(REPOSITORY_ROOT)
      .filter(({ manifest }) => checkIsHeadlessPackage(manifest))
      .flatMap((workspacePackage) =>
        getHeadlessPackageFailures(workspacePackage.manifest, readSourceFiles(workspacePackage)),
      );

    expect(failures).toStrictEqual([]);
  });
});
