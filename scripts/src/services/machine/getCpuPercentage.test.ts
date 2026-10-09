import { getCpuPercentage } from "#src/services/machine/getCpuPercentage";
import { describe, expect, test } from "vitest";

describe(getCpuPercentage, () => {
  test("is the busy share of the time that passed between two readings", () => {
    expect.hasAssertions();

    expect(getCpuPercentage({ busy: 100, total: 1000 }, { busy: 300, total: 1400 })).toBe(50);
  });
});
