import { formatCacheHitLabel } from "@/services/cli/formatCacheHitLabel";
import { describe, expect, test } from "vitest";

describe(formatCacheHitLabel, () => {
  test("passes the label through unchanged when color is off", () => {
    expect.hasAssertions();

    expect(formatCacheHitLabel("snapshot cache hit")).toBe("snapshot cache hit");
  });
});
