import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { readComputeQueue } from "#src/services/fleet/readComputeQueue";
import { describe, expect, test } from "vitest";

describe(readComputeQueue, () => {
  const PAGE_A =
    "## Queue\n\n- [ ] `[cpu]` {alpha-run} needs game-install — **Alpha.** Writes `a/b.json`.\n\n## Waiting\n\n";
  const PAGE_B =
    "## Queue\n\n- [ ] `[page]` {beta-run} needs parity-page — **Beta.**\n\n## Waiting\n\n- [ ] `[cpu]` {gamma-run} — **Gamma.**\n";
  const INDEX = [
    "## Queue",
    "",
    "- [ ] `[cpu]` {index-run} — **Index.**",
    "",
    "## Phases",
    "",
    "| Area | Page | Kind | Phase |",
    "| :--- | :--- | :--- | :---: |",
    "| Alpha | [Alpha](a/design.md) | Screen | 4 |",
    "| Beta | [Beta](b/design.md) | Region | 1 |",
    "| Charlie | [Charlie](c/design.md) | Scene | 6 |",
    "",
  ].join("\n");

  test("A compute item takes its area's phase from its page's row, the designs read in path order", () => {
    expect.hasAssertions();

    expect(
      readComputeQueue([
        { path: "compute/README.md", text: INDEX },
        { path: "compute/b/spec.md", text: "## Queue\n\n- [ ] `[cpu]` {spec-run} — **Spec.**\n" },
        { path: "compute/b/design.md", text: PAGE_B },
        { path: "compute/a/design.md", text: PAGE_A },
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
          phase: 4,
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
          phase: 1,
          touches: [],
          waiting: "",
        },
      ],
      skipped: 0,
    });
  });

  test("A compute item takes its area's phase, and a page with no row fails the read naming the page", () => {
    expect.hasAssertions();

    expect(() =>
      readComputeQueue([
        { path: "compute/README.md", text: INDEX },
        { path: "compute/d/design.md", text: PAGE_A },
      ]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: compute/d/design.md, its area has no row in the Phases table of the compute README]`,
    );
  });

  test("throws on an id two designs share", () => {
    expect.hasAssertions();

    expect(() =>
      readComputeQueue([
        { path: "compute/README.md", text: INDEX },
        { path: "compute/a/design.md", text: PAGE_A },
        { path: "compute/c/design.md", text: PAGE_A },
      ]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: alpha-run, more than one compute design holds this id]`,
    );
  });
});
