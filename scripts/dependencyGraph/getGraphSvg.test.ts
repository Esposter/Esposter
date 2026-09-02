import { GRAPH_FILENAME } from "#scripts/dependencyGraph/constants";
import { getGraphSvg } from "#scripts/dependencyGraph/getGraphSvg";
import { getWorkspaceEdges } from "#scripts/dependencyGraph/getWorkspaceEdges";
import { getWorkspacePackages } from "#scripts/services/getWorkspacePackages";
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

    const root = resolve(import.meta.dirname, "..", "..");
    const workspacePackages = getWorkspacePackages(root);
    await expect(getGraphSvg(workspacePackages, getWorkspaceEdges(workspacePackages))).resolves.toBe(
      readFileSync(resolve(root, GRAPH_FILENAME), "utf8"),
    );
  });
});
