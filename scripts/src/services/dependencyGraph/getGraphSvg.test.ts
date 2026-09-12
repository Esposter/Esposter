import { REPOSITORY_ROOT } from "#src/services/constants";
import { GRAPH_FILENAME } from "#src/services/dependencyGraph/constants";
import { getGraphSvg } from "#src/services/dependencyGraph/getGraphSvg";
import { getWorkspaceEdges } from "#src/services/dependencyGraph/getWorkspaceEdges";
import { getWorkspacePackages } from "#src/services/getWorkspacePackages";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

// The svg is committed and nothing downstream fails on a stale one: a package gaining a sibling dependency leaves
// The README showing last month's graph with typecheck, lint and the suite all green. `dot` lays out from the
// Same wasm build on every machine, so the bytes are the artifact and this is the only thing that notices them
// Falling behind.
describe(getGraphSvg, () => {
  test("matches the committed graph", async () => {
    expect.hasAssertions();

    const workspacePackages = getWorkspacePackages(REPOSITORY_ROOT);
    await expect(getGraphSvg(workspacePackages, getWorkspaceEdges(workspacePackages))).resolves.toBe(
      readFileSync(resolve(REPOSITORY_ROOT, GRAPH_FILENAME), "utf8"),
    );
  });
});
