import { getGraphSvg } from "#src/services/dependencyGraph/getGraphSvg";
import { checkGraph } from "#src/services/precheck/checkGraph";
import { describe, expect, test } from "vitest";

// The svg is committed and nothing downstream fails on a stale one: a package gaining a sibling dependency leaves
// The README showing last month's graph with typecheck, lint and the suite all green. `dot` lays out from the
// Same wasm build on every machine, so the bytes are the artifact and this is what notices them falling behind in CI,
// While `ai:precheck` runs the same check, `checkGraph`, before a push.
describe(getGraphSvg, () => {
  test("matches the committed graph", async () => {
    expect.hasAssertions();

    await expect(checkGraph(false)).resolves.toStrictEqual({ findings: [], regenerated: [] });
  });
});
