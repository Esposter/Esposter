import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { readComputeQueue } from "#src/services/fleet/readComputeQueue";
import { describe, expect, test } from "vitest";

describe(readComputeQueue, () => {
  const PAGE_A =
    "## Queue\n\n- [ ] `[cpu]` {alpha-run} needs game-install — **Alpha.** Writes `a/b.json`.\n\n## Waiting\n\n";
  const PAGE_B =
    "## Queue\n\n- [ ] `[page]` {beta-run} needs parity-page — **Beta.**\n\n## Waiting\n\n- [ ] `[cpu]` {gamma-run} — **Gamma.**\n";

  test("reads every page but the index, the runnable items of each in page-path order", () => {
    expect.hasAssertions();

    expect(
      readComputeQueue([
        { path: "compute/index.md", text: "## Queue\n\n- [ ] `[cpu]` {index-run} — **Index.**\n" },
        { path: "compute/b-page.md", text: PAGE_B },
        { path: "compute/a-page.md", text: PAGE_A },
      ]),
    ).toStrictEqual({
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

    expect(() =>
      readComputeQueue([
        { path: "compute/a-page.md", text: PAGE_A },
        { path: "compute/c-page.md", text: PAGE_A },
      ]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: alpha-run, more than one compute page holds this id]`,
    );
  });
});
