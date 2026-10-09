import { rollOreDropCount } from "#src/services/gathering/rollOreDropCount";
import { describe, expect, test } from "vitest";

describe(rollOreDropCount, () => {
  test("drops one piece, and one more for each extra draw under the chance", () => {
    expect.hasAssertions();
    expect(rollOreDropCount(() => 0.5)).toBe(1);
    expect(rollOreDropCount(() => 0.05)).toBe(3);
  });
});
