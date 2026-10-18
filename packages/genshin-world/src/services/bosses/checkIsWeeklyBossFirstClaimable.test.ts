import { checkIsWeeklyBossFirstClaimable } from "#src/services/bosses/checkIsWeeklyBossFirstClaimable";
import { claimWeeklyBossFirstClear } from "#src/services/bosses/claimWeeklyBossFirstClear";
import { markWeeklyBossTopClear } from "#src/services/bosses/markWeeklyBossTopClear";
import { describe, expect, test } from "vitest";

const ENTRY_ID = 42;

describe(checkIsWeeklyBossFirstClaimable, () => {
  test("a weekly boss's first clear is claimable once its highest difficulty has been cleared", () => {
    expect.hasAssertions();

    expect(checkIsWeeklyBossFirstClaimable(markWeeklyBossTopClear(new Set(), ENTRY_ID), ENTRY_ID)).toBe(true);
  });

  test("a weekly boss whose highest difficulty is not cleared has no first clear to claim", () => {
    expect.hasAssertions();

    expect(checkIsWeeklyBossFirstClaimable(new Set(), ENTRY_ID)).toBe(false);
  });

  test("a first clear claimed once is not claimable again", () => {
    expect.hasAssertions();

    const { clearedDomainIds } = claimWeeklyBossFirstClear(
      markWeeklyBossTopClear(new Set(), ENTRY_ID),
      String(ENTRY_ID),
    );

    expect(checkIsWeeklyBossFirstClaimable(clearedDomainIds, ENTRY_ID)).toBe(false);
  });
});
