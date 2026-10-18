import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NOBLESSE_OBLIGE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createNoblesseObligeSetModule } from "#src/services/artifact/sets/createNoblesseObligeSetModule";
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
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
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
    .get(NOBLESSE_OBLIGE_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};

describe(createNoblesseObligeSetModule, () => {
  test("gives every deployed member 20% more ATK for 12 seconds when its wearer uses its Elemental Burst from four pieces", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    createNoblesseObligeSetModule(bonusOf(4)).onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed },
      createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]) }),
      wearer,
    );
    expect(
      kitEffectState.effects
        .filter((effect): effect is KitBuff => effect.kind === "buff")
        .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([
      { amount: 0.2, attribute: Attribute.AttackPercent, secondsRemaining: 12 },
      { amount: 0.2, attribute: Attribute.AttackPercent, secondsRemaining: 12 },
    ]);
  });

  test("raises the Elemental Burst DMG of each strike its wearer's burst lands by 20% from two pieces, and no other strike", () => {
    expect.hasAssertions();

    const createStrike = (attackTag: AttackTag): KitStrike => ({
      attackTag,
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant: wearer,
      hit: TRAVELER_KIT.plungeCollision,
    });
    const party = createParty([TRAVELER_CHARACTER_ID]);
    const { getStrikeDamageBonus } = createNoblesseObligeSetModule(bonusOf(2));

    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalBurst), enemy, party, [])).toBeCloseTo(0.2);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, party, [])).toBe(0);
  });
});
