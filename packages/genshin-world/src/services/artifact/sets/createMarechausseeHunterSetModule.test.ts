import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { MARECHAUSSEE_HUNTER_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createMarechausseeHunterSetModule } from "#src/services/artifact/sets/createMarechausseeHunterSetModule";
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
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const createStrike = (attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wearer,
  hit: KIT.plungeCollision,
});
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(MARECHAUSSEE_HUNTER_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};
const healthChangedOf = (characterId: number) =>
  ({
    bondOfLifeShare: 0,
    characterId,
    healthShare: -0.1,
    kind: KitEventKind.HealthChanged,
    overflowHealthShare: 0,
  }) as const;

describe(createMarechausseeHunterSetModule, () => {
  test("raises the DMG of its wearer's Normal and Charged Attacks by 15% from two pieces, and of no other strike", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const { getStrikeDamageBonus } = createMarechausseeHunterSetModule(bonusOf(2));

    expect(getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, [])).toBeCloseTo(0.15);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ChargedAttack), enemy, party, [])).toBeCloseTo(0.15);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, party, [])).toBe(0);
  });

  test("raises the CRIT Rate of its wearer by 12% for 5 seconds on each change to its HP from four pieces, up to three", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { getPassiveBonuses, onKitEvent } = createMarechausseeHunterSetModule(bonusOf(4));
    const criticalRateBonus = () =>
      (getPassiveBonuses?.(wearer, 1, [wearer], kitEffectState.effects) ?? []).reduce(
        (total, { amount }) => total + amount,
        0,
      );

    onKitEvent?.(healthChangedOf(TRAVELER_CHARACTER_ID), context, wearer);
    expect(criticalRateBonus()).toBeCloseTo(0.12);

    for (let index = 0; index < 4; index++) onKitEvent?.(healthChangedOf(TRAVELER_CHARACTER_ID), context, wearer);
    expect(criticalRateBonus()).toBeCloseTo(0.36);
  });

  test("raises no CRIT Rate from a change to another member's HP", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { getPassiveBonuses, onKitEvent } = createMarechausseeHunterSetModule(bonusOf(4));

    onKitEvent?.(healthChangedOf(OTHER_CHARACTER_ID), context, wearer);

    expect(getPassiveBonuses?.(wearer, 1, [wearer], kitEffectState.effects)).toStrictEqual([
      { amount: 0, attribute: Attribute.CriticalRate },
    ]);
  });
});
