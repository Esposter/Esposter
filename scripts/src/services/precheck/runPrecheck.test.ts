import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { GRAPH_FILENAME } from "#src/services/dependencyGraph/constants";
import { PRECHECK_FIX_FINDING } from "#src/services/precheck/constants";
import { runPrecheck } from "#src/services/precheck/runPrecheck";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/dependencyGraph/readGraph"), () => ({
  readGraph: () =>
    Promise.resolve({ svg: " ", workspaceEdges: { development: [], runtime: [] }, workspacePackages: [] }),
}));
// The precheck of a linked worktree, where a manifest change used to skip the graph check without a finding
vi.mock(import("#src/services/queue/checkIsLinkedWorktree"), () => ({ checkIsLinkedWorktree: () => true }));
vi.mock(import("#src/services/queue/readChangedFiles"), () => ({
  readChangedFiles: () => [{ path: "packages/shared/package.json", status: ChangeStatus.Modified }],
}));
vi.mock(import("#src/services/precheck/readUnformattedPaths"), () => ({ readUnformattedPaths: () => [] }));
vi.mock(import("#src/services/precheck/checkLedgerUnits"), () => ({
  checkLedgerUnits: () => ({ findings: [], regenerated: [] }),
}));
vi.mock(import("#src/services/precheck/checkLedgerTrailers"), () => ({ checkLedgerTrailers: () => [] }));

describe(runPrecheck, () => {
  // The committed graph is not the empty drawing the mocked reader returns, so it is stale against the manifest change
  test("names a stale graph for a manifest change in a linked worktree", async () => {
    expect.hasAssertions();

    await expect(runPrecheck(false)).resolves.toStrictEqual({
      findings: [`stale ${GRAPH_FILENAME}`, PRECHECK_FIX_FINDING],
      regenerated: [],
    });
  });
});
