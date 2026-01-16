import { truncate } from "@/util/text/truncate";
import { describe, expect, test } from "vitest";

describe(truncate, () => {
  test("truncates string", () => {
    expect.hasAssertions();

    expect(truncate("", 0)).toBe("");
    expect(truncate(" ", 0)).toBe('..."');
  });
});
