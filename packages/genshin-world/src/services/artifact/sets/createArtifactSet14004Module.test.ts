import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ARTIFACT_SET_14004_ID } from "#src/services/artifact/constants";
import { createArtifactSet14004Module } from "#src/services/artifact/sets/createArtifactSet14004Module";
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

describe(createArtifactSet14004Module, () => {
  const bonus = statTables.artifactSetDataMap.get(ARTIFACT_SET_14004_ID)?.bonuses.find((b) => b.pieceCount === 4);
  assert.exists(bonus);
  const module = createArtifactSet14004Module(bonus);
  const party = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

  test.each([
    ["Elemental Skill", { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }],
    ["Elemental Burst", { characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed }],
  ] as const)(
    "gives every deployed member 20% more healing received for 10 seconds when its wearer uses its %s",
    (_action, event) => {
      expect.hasAssertions();

      const kitEffectState: KitEffectState = { effects: [] };
      module.onKitEvent?.(event, createKitTestContext(wearer, { kitEffectState, party }), wearer);
      expect(
        kitEffectState.effects.map(({ amount, attribute, secondsRemaining }) => ({
          amount,
          attribute,
          secondsRemaining,
        })),
      ).toStrictEqual([
        { amount: 0.2, attribute: Attribute.IncomingHealingBonus, secondsRemaining: 10 },
        { amount: 0.2, attribute: Attribute.IncomingHealingBonus, secondsRemaining: 10 },
      ]);
    },
  );
});
