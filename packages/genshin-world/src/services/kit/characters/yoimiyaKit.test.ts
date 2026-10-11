import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { YOIMIYA_CHARACTER_ID } from "#src/services/character/constants";
import { createYoimiyaKit } from "#src/services/kit/characters/yoimiyaKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const YOIMIYA_KIT = createYoimiyaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [YOIMIYA_CHARACTER_ID]));

const createYoimiyaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: YOIMIYA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: YOIMIYA_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

describe(createYoimiyaKit, () => {
  test("Niwabi Fire-Dance infuses Yoimiya with Pyro as it starts, for the table's seconds", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };

    YOIMIYA_KIT.elementalSkill.onStart?.({
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant: createYoimiyaCombatant(),
      kitEffectState,
    });

    expect(kitEffectState.effects).toStrictEqual([
      { characterId: YOIMIYA_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 10 },
    ]);
  });
});
