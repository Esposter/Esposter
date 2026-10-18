import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { MARTIAL_ARTIST_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createMartialArtistSetModule } from "#src/services/artifact/sets/createMartialArtistSetModule";
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
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(MARTIAL_ARTIST_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};

describe(createMartialArtistSetModule, () => {
  test("prices its wearer at 15% more Normal and Charged Attack DMG from two pieces", () => {
    expect.hasAssertions();

    expect(createMartialArtistSetModule(bonusOf(2)).getPassiveBonuses?.(wearer, 1, [], [])).toStrictEqual([
      { amount: 0.15, attribute: Attribute.NormalAttackDamageBonus },
      { amount: 0.15, attribute: Attribute.ChargedAttackDamageBonus },
    ]);
  });

  test("gives its wearer 25% more Normal and Charged Attack DMG for 8 seconds after its Elemental Skill from four pieces", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    createMartialArtistSetModule(bonusOf(4)).onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed },
      createKitTestContext(wearer, { kitEffectState }),
      wearer,
    );
    expect(
      kitEffectState.effects
        .filter((effect): effect is KitBuff => effect.kind === "buff")
        .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([
      { amount: 0.25, attribute: Attribute.NormalAttackDamageBonus, secondsRemaining: 8 },
      { amount: 0.25, attribute: Attribute.ChargedAttackDamageBonus, secondsRemaining: 8 },
    ]);
  });
});
