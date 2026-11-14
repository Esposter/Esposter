import { GRAPH_FILENAME } from "#src/services/dependencyGraph/constants";
import { getGraphSvg } from "#src/services/dependencyGraph/getGraphSvg";
import { readGraph } from "#src/services/dependencyGraph/readGraph";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

// The svg is committed and nothing downstream fails on a stale one: a package gaining a sibling dependency leaves
// The README showing last month's graph with typecheck, lint and the suite all green. `dot` lays out from the
// Same wasm build on every machine, so the bytes are the artifact and this is what notices them falling behind in CI,
// While `ai:precheck` runs the same comparison before a push.
describe(getGraphSvg, () => {
  test("matches the committed graph", async () => {
    expect.hasAssertions();

    const { svg } = await readGraph();

    expect(svg).toBe(readFileSync(resolve(REPOSITORY_ROOT, GRAPH_FILENAME), "utf8"));
  });
});
