import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getSkillReadySeconds } from "#src/services/kit/getSkillReadySeconds";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

const createCombatant = (kit: Kit): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 1,
  elementalResonances: [],
  kit,
  level: 90,
});

describe(getSkillReadySeconds, () => {
  const SKILL_COOLDOWN_SECONDS = 10;

  test("waits out one use's cooldown less for each charge a constellation adds, and the whole cooldown without one", () => {
    expect.hasAssertions();
    const kit: Kit = {
      ...TRAVELER_KIT,
      elementalSkillCharges: 1,
      getSkillChargeBonus: () => 1,
      skillCooldownSeconds: SKILL_COOLDOWN_SECONDS,
    };
    const plainKit: Kit = { ...kit, getSkillChargeBonus: undefined };

    expect(getSkillReadySeconds(kit, createCombatant(kit), 15)).toBe(5);
    expect(getSkillReadySeconds(plainKit, createCombatant(plainKit), 15)).toBe(15);
  });
});
