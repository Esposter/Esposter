import { storeCollectorPoints } from "#src/services/gadget/storeCollectorPoints";
import { describe, expect, test } from "vitest";

describe(storeCollectorPoints, () => {
  test("a collector stores its points up to its maximum", () => {
    expect.hasAssertions();

    expect(storeCollectorPoints(4, 2, 5)).toBe(5);
    expect(storeCollectorPoints(1, 2, 5)).toBe(3);
  });
});
