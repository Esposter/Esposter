import { computeForgeQueueCount } from "#src/services/forging/computeForgeQueueCount";
import { describe, expect, test } from "vitest";

describe(computeForgeQueueCount, () => {
  test("should open one queue at first, and another at each rank the game opens one at", () => {
    expect.hasAssertions();

    expect(computeForgeQueueCount(1)).toBe(1);
    expect(computeForgeQueueCount(4)).toBe(1);
    expect(computeForgeQueueCount(5)).toBe(2);
    expect(computeForgeQueueCount(10)).toBe(3);
    expect(computeForgeQueueCount(15)).toBe(4);
    expect(computeForgeQueueCount(20)).toBe(4);
  });
});
