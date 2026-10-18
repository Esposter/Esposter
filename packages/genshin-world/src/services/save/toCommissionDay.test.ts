import type { CommissionDaySave } from "#src/models/commission/CommissionDaySave";

import { toCommissionDay } from "#src/services/save/toCommissionDay";
import { describe, expect, test } from "vitest";

describe(toCommissionDay, () => {
  const DEALT_AT = "1970-01-01T00:00:00Z";

  test("should read the bonus flag a save holds", () => {
    expect.hasAssertions();
    expect(
      toCommissionDay({
        claimedCommissionIds: [1, 2, 3, 4],
        dealtAt: DEALT_AT,
        dealtCommissions: [],
        isBonusClaimed: false,
      }).isBonusClaimed,
    ).toBe(false);
  });

  // A save from before the bonus was claimed at Katheryne's paid it on the day's fourth claim, so a day of four without the
  // Flag has had its bonus
  test("should read a day of four claims saved without the flag as having its bonus claimed", () => {
    expect.hasAssertions();
    const legacy: CommissionDaySave = { claimedCommissionIds: [1, 2, 3, 4], dealtAt: DEALT_AT, dealtCommissions: [] };
    expect(toCommissionDay(legacy).isBonusClaimed).toBe(true);
  });

  test("should read a day short of four claims saved without the flag as having its bonus unclaimed", () => {
    expect.hasAssertions();
    const legacy: CommissionDaySave = { claimedCommissionIds: [1, 2, 3], dealtAt: DEALT_AT, dealtCommissions: [] };
    expect(toCommissionDay(legacy).isBonusClaimed).toBe(false);
  });
});
