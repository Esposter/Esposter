import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { THOMA_CHARACTER_ID } from "#src/services/character/constants";
import { createThomaKit } from "#src/services/kit/characters/thomaKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const THOMA_KIT = createThomaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [THOMA_CHARACTER_ID]));

const createThomaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: THOMA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: THOMA_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

describe(createThomaKit, () => {
  test("Blazing Blessing sets a shield of the table's share of Max HP and flat HP, and infuses Thoma with Pyro", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };

    THOMA_KIT.elementalSkill.onStart?.({
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant: createThomaCombatant(),
      kitEffectState,
    });

    expect(kitEffectState.effects).toStrictEqual([
      {
        characterId: THOMA_CHARACTER_ID,
        element: Element.Pyro,
        health: 0.072 * 10_000 + 693.33484,
        kind: "shield",
        secondsRemaining: 8,
      },
      { characterId: THOMA_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 0.5 },
    ]);
  });
});
