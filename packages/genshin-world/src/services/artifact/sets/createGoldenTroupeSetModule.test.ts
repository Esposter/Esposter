import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";

import { AttackTag } from "#src/models/combat/AttackTag";

import { KitEventKind } from "#src/models/kit/KitEventKind";

import { GOLDEN_TROUPE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createGoldenTroupeSetModule } from "#src/services/artifact/sets/createGoldenTroupeSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { assert, describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 2;
const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wearer: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KIT,
  level: 1,
};
const createStrike = (attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wearer,
  hit: KIT.plungeCollision,
});
const enemy = createEnemy(await readEnemyTables(GAME_DATA_LOCAL_BASE_URL), [], ENEMY_CAMP_MEMBER, "");
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(GOLDEN_TROUPE_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};

describe(createGoldenTroupeSetModule, () => {
  test("raises Elemental Skill DMG by 20% from two pieces, and of no other strike", () => {
    expect.hasAssertions();

    const { getStrikeDamageBonus } = createGoldenTroupeSetModule(bonusOf(2));
    const party = createParty([TRAVELER_CHARACTER_ID]);

    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, party, [])).toBeCloseTo(0.2);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, [])).toBe(0);
  });

  test("raises Elemental Skill DMG by 25% on the field, and by 25% more off it and for 2 seconds after taking it, from four pieces", () => {
    expect.hasAssertions();

    const { getStrikeDamageBonus, onKitEvent } = createGoldenTroupeSetModule(bonusOf(4));
    const onField = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const offField = createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: onField });

    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, onField, [])).toBeCloseTo(0.25);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, offField, [])).toBeCloseTo(0.5);

    onKitEvent?.(
      {
        characterId: TRAVELER_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: OTHER_CHARACTER_ID,
      },
      context,
      wearer,
    );
    expect(
      getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, onField, kitEffectState.effects),
    ).toBeCloseTo(0.5);
  });
});
