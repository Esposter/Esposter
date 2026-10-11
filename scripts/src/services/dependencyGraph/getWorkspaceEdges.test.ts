import type { PnpmProject } from "#src/models/dependencyGraph/PnpmProject";
import type { WorkspacePackage } from "#src/models/shared/WorkspacePackage";

import { getWorkspaceEdges } from "#src/services/dependencyGraph/getWorkspaceEdges";
import { describe, expect, test } from "vitest";

// The real workspace declares no sibling in both a runtime field and `devDependencies`, and never points a
// Sibling's name at a registry version, so the committed graph proves neither rule — both would fall out silently
// And only show up as a second dashed curve laid over a solid one the first time someone writes them.
describe(getWorkspaceEdges, () => {
  const workspacePackages: WorkspacePackage[] = [
    { directory: "web", manifest: { name: "@esposter/web" }, workspaceDirectory: "apps" },
    { directory: "configuration", manifest: { name: "@esposter/configuration" }, workspaceDirectory: "packages" },
    { directory: "shared", manifest: { name: "@esposter/shared" }, workspaceDirectory: "packages" },
  ];
  const pnpmProjects: PnpmProject[] = [
    {
      dependencies: { "@esposter/shared": { version: "link:../../packages/shared" } },
      devDependencies: {
        "@esposter/configuration": { version: "link:../../packages/configuration" },
        "@esposter/shared": { version: "link:../../packages/shared" },
      },
      name: "@esposter/web",
    },
    { devDependencies: { "@esposter/shared": { version: "1.0.0" } }, name: "@esposter/configuration" },
    { name: "@esposter/shared" },
    { devDependencies: { "@esposter/web": { version: "link:apps/web" } }, name: "root" },
  ];

  test("draws a sibling declared in both fields once, at runtime", () => {
    expect.hasAssertions();

    expect(getWorkspaceEdges(workspacePackages, pnpmProjects)).toStrictEqual({
      development: [{ from: "web", to: "configuration" }],
      runtime: [{ from: "web", to: "shared" }],
    });
  });
});
