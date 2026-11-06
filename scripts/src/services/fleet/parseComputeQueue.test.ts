import { COMPUTE_UNNAMED_BLOCKER } from "#src/services/fleet/constants";
import { parseComputeQueue } from "#src/services/fleet/parseComputeQueue";
import { describe, expect, test } from "vitest";

describe(parseComputeQueue, () => {
  const PAGE = [
    "## Queue",
    "",
    "- [ ] `[cpu]` {first-run} needs game-install — **First.** Writes `a/b.json`.",
    "- [x] `[cpu]` {done-run} — **Done.**",
    "- [ ] `[page]` {second-run} needs parity-page — **Second.**",
    "",
    "## Waiting",
    "",
    "- [ ] `[cpu]` {waiting-run} — **Waiting.**",
    "",
    "## Notes",
    "",
    "- [ ] `[cpu]` {after-section} — **Not in the page's queue.**",
  ].join("\n");

  test("reads the open items under the queue heading, in page order", () => {
    expect.hasAssertions();

    expect(parseComputeQueue(PAGE).entries.map(({ id }) => id)).toStrictEqual(["first-run", "second-run"]);
  });

  test("counts an open line with no id as skipped, under the queue heading or the waiting one", () => {
    expect.hasAssertions();

    expect(
      parseComputeQueue(
        "## Queue\n\n- [ ] `[cpu]` **Untagged.** Writes `a.ts`.\n\n## Waiting\n\n- [ ] `[page]` **Waiting, no id.**",
      ),
    ).toStrictEqual({ entries: [], skipped: 2, waiting: [] });
  });

  test("reads each waiting item with the blocker its line names, or the fallback when it names none", () => {
    expect.hasAssertions();

    expect(
      parseComputeQueue(
        [
          "## Queue",
          "",
          "## Waiting",
          "",
          "- [ ] `[page]` {waits-run} needs parity-page — **Waits.** Waits on a plate.",
          "- [ ] `[page]` {blocked-run} — **Blocked.** Reads `a.png`. — blocked: no reference names its buttons",
          "- [ ] `[page]` {input-run} — **Input.** input missing: a recording of the shafts. Measure: x",
          "- [ ] `[page]` {unnamed-run} — **Unnamed.** Reads `a.png`.",
        ].join("\n"),
      ).waiting.map(({ id, waiting }) => ({ id, waiting })),
    ).toStrictEqual([
      { id: "waits-run", waiting: "a plate" },
      { id: "blocked-run", waiting: "no reference names its buttons" },
      { id: "input-run", waiting: "a recording of the shafts" },
      { id: "unnamed-run", waiting: COMPUTE_UNNAMED_BLOCKER },
    ]);
  });

  test("reads the waiting items of a page with no queue heading, since a page may hold only waiting items", () => {
    expect.hasAssertions();

    expect(
      parseComputeQueue(
        "# Wish\n\n## Waiting\n\n- [ ] `[page]` {wish-run} — **Wish.** Waits on a plate.\n",
      ).waiting.map(({ id }) => id),
    ).toStrictEqual(["wish-run"]);
  });

  test("reads no items from a page with no queue heading", () => {
    expect.hasAssertions();

    expect(parseComputeQueue("## Opening\n\n- [ ] `[cpu]` {elsewhere} — x")).toStrictEqual({
      entries: [],
      skipped: 0,
      waiting: [],
    });
  });
});
