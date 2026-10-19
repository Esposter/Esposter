import { checkIsGcgCardGameOpen } from "#src/services/gcg/checkIsGcgCardGameOpen";
import { describe, expect, test } from "vitest";

describe(checkIsGcgCardGameOpen, () => {
  test("reaching Adventure Rank 32 opens the card game", () => {
    expect.hasAssertions();
    expect(checkIsGcgCardGameOpen(32)).toBe(true);
    expect(checkIsGcgCardGameOpen(60)).toBe(true);
  });

  test("below Adventure Rank 32 the card game stays closed", () => {
    expect.hasAssertions();
    expect(checkIsGcgCardGameOpen(31)).toBe(false);
    expect(checkIsGcgCardGameOpen(1)).toBe(false);
  });
});
