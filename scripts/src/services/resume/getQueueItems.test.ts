import { getQueueItems } from "#src/services/resume/getQueueItems";
import { describe, expect, test } from "vitest";

describe(getQueueItems, () => {
  test.each([
    [0, 0, []],
    [2, 0, [{ action: "pnpm ai:queue:push", text: "2 ahead of origin/ai/queue" }]],
    [0, 1, [{ action: "", text: "1 behind origin/ai/queue" }]],
  ])("reads %i ahead and %i behind", (ahead, behind, items) => {
    expect.hasAssertions();

    expect(getQueueItems(ahead, behind)).toStrictEqual(items);
  });
});
