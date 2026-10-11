import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { getSupersededCatalogEntries } from "#src/services/dependencyAdmission/getSupersededCatalogEntries";
import { SupersededPackageMap } from "#src/services/dependencyAdmission/SupersededPackageMap";
import { getSection } from "#src/services/outdatedDependencies/workspace/getSection";
import { parseWorkspaceEntries } from "#src/services/outdatedDependencies/workspace/parseWorkspaceEntries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { WORKSPACE_FILE } from "@esposter/configuration";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// A predecessor its successor replaced is never marked deprecated by npm, so nothing else fails when the catalog keeps
// It. Each one in `SupersededPackageMap` fails here and names the successor and the source that says so.
describe("supersededPackages", () => {
  test("the catalog lists no package the map supersedes", () => {
    expect.hasAssertions();

    const workspaceYaml = readFileSync(join(REPOSITORY_ROOT, WORKSPACE_FILE), "utf8");
    const catalogNames = parseWorkspaceEntries(
      DependencyGroup.Catalog,
      getSection(DependencyGroup.Catalog, workspaceYaml),
    ).map(({ packageName }) => packageName);

    expect(getSupersededCatalogEntries(catalogNames, SupersededPackageMap)).toStrictEqual([]);
  });
});
