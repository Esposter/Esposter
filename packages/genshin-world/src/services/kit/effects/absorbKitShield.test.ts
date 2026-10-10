import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { absorbKitShield } from "#src/services/kit/effects/absorbKitShield";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(absorbKitShield, () => {
  const CHARACTER_ID = TRAVELER_CHARACTER_ID;

  const OTHER_CHARACTER_ID = 2;

  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
  };

  test("absorbs damage up to its health and gives back the rest, and is spent when its health runs out", () => {
    expect.hasAssertions();
    const effects: KitEffect[] = [{ characterId: CHARACTER_ID, health: 100, kind: "shield", secondsRemaining: 12 }];
    expect(absorbKitShield(effects, combatant, 40)).toBe(0);
    expect(absorbKitShield(effects, combatant, 80)).toBe(20);
    expect(effects).toStrictEqual([{ characterId: CHARACTER_ID, health: 0, kind: "shield", secondsRemaining: 0 }]);
  });

  test("takes a strike on the character on the field from a shield another character cast", () => {
    expect.hasAssertions();
    const effects: KitEffect[] = [
      { characterId: OTHER_CHARACTER_ID, health: 100, kind: "shield", secondsRemaining: 12 },
    ];
    expect(absorbKitShield(effects, combatant, 40)).toBe(0);
    expect(effects).toStrictEqual([
      { characterId: OTHER_CHARACTER_ID, health: 60, kind: "shield", secondsRemaining: 12 },
    ]);
  });

  test("every live shield takes the strike at once, and the character loses the least any of them passes on", () => {
    expect.hasAssertions();
    const effects: KitEffect[] = [
      { characterId: OTHER_CHARACTER_ID, health: 30, kind: "shield", secondsRemaining: 12 },
      { characterId: CHARACTER_ID, health: 20, kind: "shield", secondsRemaining: 12 },
    ];
    expect(absorbKitShield(effects, combatant, 80)).toBe(50);
    expect(effects).toStrictEqual([
      { characterId: OTHER_CHARACTER_ID, health: 0, kind: "shield", secondsRemaining: 0 },
      { characterId: CHARACTER_ID, health: 0, kind: "shield", secondsRemaining: 0 },
    ]);
  });

  test("a recast by the caster while another character is on the field replaces only her shield, and the strike still reaches the shields left", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = {
      effects: [
        { characterId: CHARACTER_ID, health: 100, kind: "shield", secondsRemaining: 12 },
        { characterId: OTHER_CHARACTER_ID, health: 100, kind: "shield", secondsRemaining: 12 },
      ],
    };
    addKitEffect(kitEffectState, { characterId: CHARACTER_ID, health: 50, kind: "shield", secondsRemaining: 12 });
    const otherCombatant = { ...combatant, characterId: OTHER_CHARACTER_ID };

    expect(absorbKitShield(kitEffectState.effects, otherCombatant, 40)).toBe(0);
    expect(kitEffectState.effects).toStrictEqual([
      { characterId: CHARACTER_ID, health: 100, kind: "shield", secondsRemaining: 0 },
      { characterId: OTHER_CHARACTER_ID, health: 60, kind: "shield", secondsRemaining: 12 },
      { characterId: CHARACTER_ID, health: 10, kind: "shield", secondsRemaining: 12 },
    ]);
  });
});
