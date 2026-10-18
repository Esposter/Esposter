import { checkIsMysticOfferingOpen } from "#src/services/crafting/checkIsMysticOfferingOpen";
import { describe, expect, test } from "vitest";

describe(checkIsMysticOfferingOpen, () => {
  test("the offering opens from adventure rank 45", () => {
    expect.hasAssertions();

    expect(checkIsMysticOfferingOpen(44)).toBe(false);
    expect(checkIsMysticOfferingOpen(45)).toBe(true);
  });
});
