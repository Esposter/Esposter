import { parseComputeQueue } from "#src/services/fleet/parseComputeQueue";
import { describe, expect, test } from "vitest";

const ROADMAP = [
  "## Compute queue",
  "",
  "Runs owed.",
  "",
  "- [ ] `[cpu]` {first-run} needs game-install — **First.** Writes `a/b.json`.",
  "- [ ] `[page]` {second-run} needs parity-page — **Second.**",
  "",
  "### Waiting",
  "",
  "- [ ] `[cpu]` {waiting-run} — **Waiting.**",
  "",
  "## Awaiting the user",
  "",
  "- [ ] `[cpu]` {after-section} — **Not in the queue.**",
].join("\n");

describe(parseComputeQueue, () => {
  test("reads the open items above the waiting heading, in roadmap order", () => {
    expect.hasAssertions();

    expect(parseComputeQueue(ROADMAP).map(({ id }) => id)).toStrictEqual(["first-run", "second-run"]);
  });

  test("reads no items from a roadmap without a compute queue", () => {
    expect.hasAssertions();

    expect(parseComputeQueue("## Opening\n\n- [ ] `[cpu]` {elsewhere} — x")).toStrictEqual([]);
  });
});
