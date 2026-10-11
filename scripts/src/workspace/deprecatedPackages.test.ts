import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { getDeprecatedPackages } from "#src/services/dependencyAdmission/getDeprecatedPackages";
import { getDirectResolutions } from "#src/services/dependencyAdmission/getDirectResolutions";
import { getSection } from "#src/services/outdatedDependencies/workspace/getSection";
import { parseWorkspaceEntries } from "#src/services/outdatedDependencies/workspace/parseWorkspaceEntries";
import { LOCKFILE_PATH, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { WORKSPACE_FILE } from "@esposter/configuration";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// Npm marks a version deprecated, and pnpm records that on the lockfile's `packages:` entry. A catalog entry is ours to
// Replace, so a deprecated resolution of one fails here with npm's own message. A deprecated transitive dependency is
// Not ours to fix and is not checked.
describe("deprecatedPackages", () => {
  test("no catalog entry resolves to a deprecated package", () => {
    expect.hasAssertions();

    const workspaceYaml = readFileSync(join(REPOSITORY_ROOT, WORKSPACE_FILE), "utf8");
    const lockYaml = readFileSync(LOCKFILE_PATH, "utf8");
    const catalogNames = parseWorkspaceEntries(
      DependencyGroup.Catalog,
      getSection(DependencyGroup.Catalog, workspaceYaml),
    ).map(({ packageName }) => packageName);
    const resolutions = getDirectResolutions(lockYaml);
    const deprecatedPackages = getDeprecatedPackages(lockYaml);

    expect(
      catalogNames.flatMap((catalogName) => {
        const resolution = resolutions.get(catalogName);
        const message = resolution === undefined ? undefined : deprecatedPackages.get(resolution);
        return message === undefined ? [] : [`${catalogName} (${resolution}): ${message}`];
      }),
    ).toStrictEqual([]);
  });
});
