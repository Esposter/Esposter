import { parseMemoryStatusLevel } from "#src/services/machine/parseMemoryStatusLevel";
import { describe, expect, test } from "vitest";

describe(parseMemoryStatusLevel, () => {
  test("reads the whole percentage sysctl prints as a share of memory", () => {
    expect.hasAssertions();

    // The bare number `sysctl -n kern.memorystatus_level` prints, with its newline
    expect(parseMemoryStatusLevel("61\n")).toBe(0.61);
  });

  test("rejects output that is not a percentage", () => {
    expect.hasAssertions();

    expect(() => parseMemoryStatusLevel("kern.memorystatus_level: 61\n")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: sysctl, reports no memory status level]`,
    );
  });
});
