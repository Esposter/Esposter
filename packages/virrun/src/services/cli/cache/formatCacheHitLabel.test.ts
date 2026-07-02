import { formatCacheHitLabel } from "@/services/cli/cache/formatCacheHitLabel";
import { stripAnsi } from "@/services/cli/color/stripAnsi.test";
import { describe, expect, test } from "vitest";

describe(formatCacheHitLabel, () => {
  test("leaves the label text intact (color aside)", () => {
    expect.hasAssertions();

    expect(stripAnsi(formatCacheHitLabel("snapshot cache hit"))).toBe("snapshot cache hit");
  });
});
