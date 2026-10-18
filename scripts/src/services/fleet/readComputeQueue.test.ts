import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { readComputeQueue } from "#src/services/fleet/readComputeQueue";
import { describe, expect, test } from "vitest";

describe(readComputeQueue, () => {
  const PAGE_A =
    "## Queue\n\n- [ ] `[cpu]` {alpha-run} needs game-install — **Alpha.** Writes `a/b.json`.\n\n## Waiting\n\n";
  const PAGE_B =
    "## Queue\n\n- [ ] `[page]` {beta-run} needs parity-page — **Beta.**\n\n## Waiting\n\n- [ ] `[cpu]` {gamma-run} — **Gamma.**\n";

  test("reads every area's design but neither the index nor a spec, the runnable items of each in path order", () => {
    expect.hasAssertions();

    expect(
      readComputeQueue([
        { path: "compute/README.md", text: "## Queue\n\n- [ ] `[cpu]` {index-run} — **Index.**\n" },
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

  test("throws on an id two designs share", () => {
    expect.hasAssertions();

    expect(() =>
      readComputeQueue([
        { path: "compute/a/design.md", text: PAGE_A },
        { path: "compute/c/design.md", text: PAGE_A },
      ]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: alpha-run, more than one compute design holds this id]`,
    );
  });
});
