import { ADVENTURE_ENCOUNTERS_UNLOCK_RANK } from "#src/services/commission/constants";
import { checkIsAdventureEncountersUnlocked } from "#src/services/commission/checkIsAdventureEncountersUnlocked";
import { describe, expect, test } from "vitest";

describe(checkIsAdventureEncountersUnlocked, () => {
  test("the Adventure Encounters panel stays locked below Adventure Rank 24", () => {
    expect.hasAssertions();
    expect(checkIsAdventureEncountersUnlocked(ADVENTURE_ENCOUNTERS_UNLOCK_RANK - 1)).toBe(false);
  });

  test("the Adventure Encounters panel opens at Adventure Rank 24", () => {
    expect.hasAssertions();
    expect(checkIsAdventureEncountersUnlocked(ADVENTURE_ENCOUNTERS_UNLOCK_RANK)).toBe(true);
  });
});
