import { checkIsQuickSwapOpen } from "#src/services/gadget/checkIsQuickSwapOpen";
import { QUICK_SWAP_HOLD_SECONDS } from "#src/services/gadget/constants";
import { stepQuickUseHeldSeconds } from "#src/services/gadget/stepQuickUseHeldSeconds";
import { describe, expect, test } from "vitest";

describe(checkIsQuickSwapOpen, () => {
  test("holding z opens the quick swap", () => {
    expect.hasAssertions();

    expect(checkIsQuickSwapOpen(stepQuickUseHeldSeconds(0, false, QUICK_SWAP_HOLD_SECONDS))).toBe(false);
    expect(checkIsQuickSwapOpen(stepQuickUseHeldSeconds(0, true, QUICK_SWAP_HOLD_SECONDS))).toBe(true);
    expect(checkIsQuickSwapOpen(stepQuickUseHeldSeconds(QUICK_SWAP_HOLD_SECONDS, false, 0))).toBe(false);
  });
});
