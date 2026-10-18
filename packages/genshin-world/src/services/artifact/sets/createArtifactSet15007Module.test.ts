import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ARTIFACT_SET_15007_ID } from "#src/services/artifact/constants";
import { createArtifactSet15007Module } from "#src/services/artifact/sets/createArtifactSet15007Module";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { assert, describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 2;
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
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(ARTIFACT_SET_15007_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};

describe(createArtifactSet15007Module, () => {
  test("gives every deployed member 20% more ATK for 12 seconds when its wearer uses its Elemental Burst from four pieces", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    createArtifactSet15007Module(bonusOf(4)).onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed },
      createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]) }),
      wearer,
    );
    expect(
      kitEffectState.effects.map(({ amount, attribute, secondsRemaining }) => ({
        amount,
        attribute,
        secondsRemaining,
      })),
    ).toStrictEqual([
      { amount: 0.2, attribute: Attribute.AttackPercent, secondsRemaining: 12 },
      { amount: 0.2, attribute: Attribute.AttackPercent, secondsRemaining: 12 },
    ]);
  });

  test("prices nothing from two pieces until a burst damage attribute exists to carry its Elemental Burst DMG bonus", () => {
    expect.hasAssertions();

    expect(createArtifactSet15007Module(bonusOf(2))).toStrictEqual({});
  });
});
