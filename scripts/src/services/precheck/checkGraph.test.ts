import { GRAPH_FILENAME } from "#src/services/dependencyGraph/constants";
import { checkGraph } from "#src/services/precheck/checkGraph";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, test, vi } from "vitest";

const { generatedSvg, repositoryRoot } = await vi.hoisted(async () => {
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join: joinPath } = await import("node:path");
  return { generatedSvg: " ", repositoryRoot: mkdtempSync(joinPath(tmpdir(), "check-graph-")) };
});

vi.mock(import("#src/services/shared/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  REPOSITORY_ROOT: repositoryRoot,
}));
// The graph is read from what pnpm has installed, which a temporary repository has none of
vi.mock(import("#src/services/dependencyGraph/readGraph"), () => ({
  readGraph: () =>
    Promise.resolve({ svg: generatedSvg, workspaceEdges: { development: [], runtime: [] }, workspacePackages: [] }),
}));

describe(checkGraph, () => {
  const graphPath = join(repositoryRoot, GRAPH_FILENAME);
  const staleSvg = "";

  afterAll(() => {
    rmSync(repositoryRoot, { force: true, recursive: true });
  });

  test("finds nothing when the committed graph is what the generator draws", async () => {
    expect.hasAssertions();

    writeFileSync(graphPath, generatedSvg);

    await expect(checkGraph(false)).resolves.toStrictEqual({ findings: [], regenerated: [] });
  });

  test("names a stale graph and leaves it as committed", async () => {
    expect.hasAssertions();

    writeFileSync(graphPath, staleSvg);

    await expect(checkGraph(false)).resolves.toStrictEqual({
      findings: [`stale ${GRAPH_FILENAME}`, "fix: pnpm ai:precheck --fix"],
      regenerated: [],
    });
    expect(readFileSync(graphPath, "utf8")).toBe(staleSvg);
  });

  test("with fix writes the generator's drawing over a stale graph", async () => {
    expect.hasAssertions();

    writeFileSync(graphPath, staleSvg);

    await expect(checkGraph(true)).resolves.toStrictEqual({ findings: [], regenerated: [GRAPH_FILENAME] });
    expect(readFileSync(graphPath, "utf8")).toBe(generatedSvg);
  });
});
