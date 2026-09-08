import type { WorkspaceEdges } from "#scripts/dependencyGraph/models/WorkspaceEdges";

import { getPackageRole } from "#scripts/dependencyGraph/getPackageRole";
import { PackageRole } from "#scripts/dependencyGraph/models/PackageRole";
import { describe, expect, test } from "vitest";

describe(getPackageRole, () => {
  // `tool` is the case the two checks disagree on: nothing depends on it and its only edge out is a development
  // One, so reading either check against the wrong set of edges would classify it as a foundation.
  const workspaceEdges: WorkspaceEdges = {
    development: [{ from: "tool", to: "foundation" }],
    runtime: [
      { from: "app", to: "library" },
      { from: "library", to: "foundation" },
    ],
  };

  test.each([
    ["app", PackageRole.Entrypoint],
    ["tool", PackageRole.Entrypoint],
    ["library", PackageRole.Library],
    ["foundation", PackageRole.Foundation],
  ])("reads %s as the %s", (directory, packageRole) => {
    expect.hasAssertions();

    expect(getPackageRole(directory, workspaceEdges)).toBe(packageRole);
  });
});
