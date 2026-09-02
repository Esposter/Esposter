import type { WorkspacePackage } from "#scripts/models/WorkspacePackage";

import { getWorkspaceEdges } from "#scripts/dependencyGraph/getWorkspaceEdges";
import { describe, expect, test } from "vitest";

// The real workspace declares no sibling in both a runtime field and `devDependencies`, and never points a
// Sibling's name at a registry version, so the committed graph proves neither rule — both would fall out silently
// And only show up as a second dashed curve laid over a solid one the first time someone writes them.
describe(getWorkspaceEdges, () => {
  const workspacePackages: WorkspacePackage[] = [
    {
      directory: "app",
      manifest: {
        dependencies: { "@esposter/shared": "workspace:^" },
        devDependencies: { "@esposter/configuration": "workspace:^", "@esposter/shared": "workspace:^" },
        name: "@esposter/app",
      },
    },
    {
      directory: "configuration",
      manifest: { devDependencies: { "@esposter/shared": "1.0.0" }, name: "@esposter/configuration" },
    },
    { directory: "shared", manifest: { name: "@esposter/shared" } },
  ];

  test("draws a sibling declared in both fields once, at runtime", () => {
    expect.hasAssertions();

    expect(getWorkspaceEdges(workspacePackages)).toStrictEqual({
      development: [{ from: "app", to: "configuration" }],
      runtime: [{ from: "app", to: "shared" }],
    });
  });
});
