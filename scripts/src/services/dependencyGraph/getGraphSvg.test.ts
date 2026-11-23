import { getGraphSvg } from "#src/services/dependencyGraph/getGraphSvg";
import { checkGraph } from "#src/services/precheck/checkGraph";
import { checkIsLinkedWorktree } from "#src/services/queue/checkIsLinkedWorktree";
import { describe, expect, test } from "vitest";

// The svg is committed and nothing downstream fails on a stale one: a package gaining a sibling dependency leaves
// The README showing last month's graph with typecheck, lint and the suite all green. `dot` lays out from the
// Same wasm build on every machine, so the bytes are the artifact and this is what notices them falling behind in CI,
// While `ai:precheck` runs the same check, `checkGraph`, before a push.
describe(getGraphSvg, () => {
  // A linked worktree's narrowed install has no edges to its siblings, so it draws a graph the checkout does not commit.
  // The precheck skips the graph there for the same reason, and CI's and the main checkout's full install check it.
  test.skipIf(checkIsLinkedWorktree())("matches the committed graph", async () => {
    expect.hasAssertions();

    await expect(checkGraph(false)).resolves.toStrictEqual({ findings: [], regenerated: [] });
  });
});
