import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { absorbKitShield } from "#src/services/kit/effects/absorbKitShield";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = TRAVELER_CHARACTER_ID;
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers([TRAVELER_CHARACTER_ID]));
const combatant: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
};

describe(absorbKitShield, () => {
  test("absorbs damage up to its health and gives back the rest, and is spent when its health runs out", () => {
    expect.hasAssertions();
    const effects: KitEffect[] = [{ characterId: CHARACTER_ID, health: 100, kind: "shield", secondsRemaining: 12 }];
    expect(absorbKitShield(effects, combatant, 40)).toBe(0);
    expect(absorbKitShield(effects, combatant, 80)).toBe(20);
    expect(effects).toStrictEqual([{ characterId: CHARACTER_ID, health: 0, kind: "shield", secondsRemaining: 0 }]);
  });

  test("passes damage through when another character holds the shield", () => {
    expect.hasAssertions();
    const effects: KitEffect[] = [{ characterId: 2, health: 100, kind: "shield", secondsRemaining: 12 }];
    expect(absorbKitShield(effects, combatant, 40)).toBe(40);
  });
});
