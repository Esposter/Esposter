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
    ).toStrictEqual({ entries: [], skipped: 2 });
  });

  test("reads no items from a page with no queue heading", () => {
    expect.hasAssertions();

    expect(parseComputeQueue("## Opening\n\n- [ ] `[cpu]` {elsewhere} — x")).toStrictEqual({ entries: [], skipped: 0 });
  });
});
