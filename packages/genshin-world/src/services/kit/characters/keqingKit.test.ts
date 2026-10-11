import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { KEQING_CHARACTER_ID } from "#src/services/kit/characters/keqingKit";
import { createKeqingKit } from "#src/services/kit/characters/keqingKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const KEQING_KIT = createKeqingKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [KEQING_CHARACTER_ID]));

const createKeqingCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: KEQING_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KEQING_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

describe(createKeqingKit, () => {
  test("the recast infuses Keqing with Electro as it starts, for the infusion's seconds", () => {
    expect.hasAssertions();
    const recast = KEQING_KIT.elementalSkillChain?.followUps[0];
    if (!recast) throw new Error("Stellar Restoration has no recast");
    const kitEffectState: KitEffectState = { effects: [] };

    recast.onStart?.({
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant: createKeqingCombatant(),
      kitEffectState,
      party: createParty([KEQING_CHARACTER_ID]),
    });

    expect(kitEffectState.effects).toStrictEqual([
      { characterId: KEQING_CHARACTER_ID, element: Element.Electro, kind: "infusion", secondsRemaining: 6 },
    ]);
  });
});
