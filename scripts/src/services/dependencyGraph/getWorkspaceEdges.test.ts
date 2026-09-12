import type { WorkspacePackage } from "#src/models/WorkspacePackage";

import { getWorkspaceEdges } from "#src/services/dependencyGraph/getWorkspaceEdges";
import { describe, expect, test } from "vitest";

// The real workspace declares no sibling in both a runtime field and `devDependencies`, and never points a
// Sibling's name at a registry version, so the committed graph proves neither rule — both would fall out silently
// And only show up as a second dashed curve laid over a solid one the first time someone writes them.
describe(getWorkspaceEdges, () => {
  const workspacePackages: WorkspacePackage[] = [
    {
      directory: "web",
      manifest: {
        dependencies: { "@esposter/shared": "workspace:^" },
        devDependencies: { "@esposter/configuration": "workspace:^", "@esposter/shared": "workspace:^" },
        name: "@esposter/web",
      },
      workspaceDirectory: "apps",
    },
    {
      directory: "configuration",
      manifest: { devDependencies: { "@esposter/shared": "1.0.0" }, name: "@esposter/configuration" },
      workspaceDirectory: "packages",
    },
    { directory: "shared", manifest: { name: "@esposter/shared" }, workspaceDirectory: "packages" },
  ];

  test("draws a sibling declared in both fields once, at runtime", () => {
    expect.hasAssertions();

    expect(getWorkspaceEdges(workspacePackages)).toStrictEqual({
      development: [{ from: "web", to: "configuration" }],
      runtime: [{ from: "web", to: "shared" }],
    });
  });
});
