import { readGcsimQueueDelay } from "#src/services/genshinAssets/kits/gcsim/readGcsimQueueDelay";
import { describe, expect, test } from "vitest";

describe(readGcsimQueueDelay, () => {
  test("adds the delay of a Tasks.Add closure and of a QueueCharTask closure around a queue call", () => {
    expect.hasAssertions();

    const lines = [
      "func (c *char) burst() {",
      "\tc.Core.Tasks.Add(func() {",
      "\t\tc.Core.QueueAttack(ai, ap, 0, 17)",
      "\t}, 93)",
      "\tc.QueueCharTask(func() {",
      "\t\tc.Core.QueueAttack(ai, ap, 0, 17)",
      "\t}, burstStart)",
      "}",
    ];

    expect(readGcsimQueueDelay(lines, 2, (name) => (name === "burstStart" ? 40 : undefined))).toBe(93);
    expect(readGcsimQueueDelay(lines, 5, (name) => (name === "burstStart" ? 40 : undefined))).toBe(40);
  });
});
