import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ARTIFACT_SET_15016_ID } from "#src/services/artifact/constants";
import { createArtifactSet15016Module } from "#src/services/artifact/sets/createArtifactSet15016Module";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wearer: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};

describe(createArtifactSet15016Module, () => {
  test("gives its wearer 30% more Normal and Charged Attack DMG for 15 seconds after its Elemental Skill from four pieces", () => {
    expect.hasAssertions();

    const bonus = statTables.artifactSetDataMap.get(ARTIFACT_SET_15016_ID)?.bonuses.find((b) => b.pieceCount === 4);
    assert.exists(bonus);
    const kitEffectState: KitEffectState = { effects: [] };
    createArtifactSet15016Module(bonus).onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed },
      createKitTestContext(wearer, { kitEffectState }),
      wearer,
    );
    expect(
      kitEffectState.effects.map(({ amount, attribute, secondsRemaining }) => ({
        amount,
        attribute,
        secondsRemaining,
      })),
    ).toStrictEqual([
      { amount: 0.3, attribute: Attribute.NormalAttackDamageBonus, secondsRemaining: 15 },
      { amount: 0.3, attribute: Attribute.ChargedAttackDamageBonus, secondsRemaining: 15 },
    ]);
  });
});
