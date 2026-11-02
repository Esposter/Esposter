import { longestBacktickRun } from "#shared/services/resource/note/serialize/longestBacktickRun";
import { describe, expect, test } from "vitest";

describe(longestBacktickRun, () => {
  const runCount = 200_000;

  test("a text with no backtick has no run", () => {
    expect.hasAssertions();

    expect(longestBacktickRun("")).toBe(0);
  });

  test("the longest of its runs", () => {
    expect.hasAssertions();

    expect(longestBacktickRun("`a``bb```")).toBe(3);
  });

  test("a text with more runs than an argument list takes", () => {
    expect.hasAssertions();

    expect(longestBacktickRun("`a".repeat(runCount))).toBe(1);
  });
});
