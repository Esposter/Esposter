import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createAfterSkillAttackDamageSetModule } from "#src/services/artifact/sets/createAfterSkillAttackDamageSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { OTHER_CHARACTER_ID } from "#src/services/weapon/passives/constants.test";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createCombatant = (characterId: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
});

describe(createAfterSkillAttackDamageSetModule, () => {
  const wearer = createCombatant(TRAVELER_CHARACTER_ID);
  const skillModule = createAfterSkillAttackDamageSetModule({ amount: 0.25, seconds: 8, source: "Set" });
  const useSkill = (kitEffectState: KitEffectState, characterId = TRAVELER_CHARACTER_ID) =>
    skillModule.onKitEvent?.(
      { characterId, kind: KitEventKind.SkillUsed },
      createKitTestContext(wearer, { kitEffectState }),
      wearer,
    );

  test("gives its wearer Normal Attack and Charged Attack DMG for its seconds after the wearer uses its Elemental Skill", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    useSkill(kitEffectState);
    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 0.25,
        attribute: Attribute.NormalAttackDamageBonus,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 8,
        source: "Set",
      },
      {
        amount: 0.25,
        attribute: Attribute.ChargedAttackDamageBonus,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 8,
        source: "Set",
      },
    ]);
  });

  test("restarts both buffs on a second use rather than stacking them", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    useSkill(kitEffectState);
    for (const effect of kitEffectState.effects) effect.secondsRemaining = 1;
    useSkill(kitEffectState);
    expect(kitEffectState.effects.map(({ secondsRemaining }) => secondsRemaining)).toStrictEqual([8, 8]);
  });

  test("is not triggered by another member's skill or by the wearer's burst", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    useSkill(kitEffectState, OTHER_CHARACTER_ID);
    skillModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, energyCost: 0, kind: KitEventKind.BurstUsed },
      createKitTestContext(wearer, { kitEffectState }),
      wearer,
    );
    expect(kitEffectState.effects).toStrictEqual([]);
  });
});
