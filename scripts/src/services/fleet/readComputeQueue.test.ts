import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { readComputeQueue } from "#src/services/fleet/readComputeQueue";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(readComputeQueue, () => {
  const PAGE_A =
    "## Queue\n\n- [ ] `[cpu]` {alpha-run} needs game-install — **Alpha.** Writes `a/b.json`.\n\n## Waiting\n\n";
  const PAGE_B =
    "## Queue\n\n- [ ] `[page]` {beta-run} needs parity-page — **Beta.**\n\n## Waiting\n\n- [ ] `[cpu]` {gamma-run} — **Gamma.**\n";
  let directory: string;

  beforeAll(() => {
    directory = mkdtempSync(join(tmpdir(), "compute-queue-"));
  });
  afterAll(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("reads every page but the index, the runnable items of each in page-name order", () => {
    expect.hasAssertions();

    writeFileSync(join(directory, "index.md"), "## Queue\n\n- [ ] `[cpu]` {index-run} — **Index.**\n");
    writeFileSync(join(directory, "b-page.md"), PAGE_B);
    writeFileSync(join(directory, "a-page.md"), PAGE_A);

    expect(readComputeQueue(directory)).toStrictEqual({
      entries: [
        {
          area: "genshin",
          id: "alpha-run",
          kind: FleetEntryKind.Queue,
          lane: "cpu",
          line: "- [ ] `[cpu]` {alpha-run} needs game-install — **Alpha.** Writes `a/b.json`.",
          needs: ["game-install"],
          touches: ["a/b.json"],
          waiting: "",
        },
        {
          area: "genshin",
          id: "beta-run",
          kind: FleetEntryKind.Queue,
          lane: "page",
          line: "- [ ] `[page]` {beta-run} needs parity-page — **Beta.**",
          needs: ["parity-page"],
          touches: [],
          waiting: "",
        },
      ],
      skipped: 0,
    });
  });

  test("throws on an id two pages share", () => {
    expect.hasAssertions();

    writeFileSync(join(directory, "c-page.md"), PAGE_A);

    expect(() => readComputeQueue(directory)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: alpha-run, more than one compute page holds this id]`,
    );
  });
});
